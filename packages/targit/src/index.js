const decompress = require('decompress');
const parseURI = require('targit-parser');
const { createWriteStream, ensureDir, exists, writeJSON, readdir } = require('fs-extra');
const { dirname, join } = require('path');
const { getArchiveDir, getHash, getRefs, TarGitError } = require('./utils');
const { homedir } = require('os');
const { default: request, requestFile } = require('@axway/amplify-request');

/**
 * The default cache location for targit.
 * @type {string}
 */
const defaultCache = join(homedir(), '.targit');

const supportedHosts = [
	'bitbucket',
	'github',
	'gitlab'
];

/**
 * Options that can be used to configure targit.
 * @typedef {Object} TarGitOptions
 * @property {string} [archiveType='tar.gz'] - Archive format to download, zip or tar.gz.
 * @property {string} [cacheDir='~/.targit'] - Top level directory to cache downloads in.
 * @property {string} [defaultHost='github'] - Default host to be used when parsing the uri, bitbucket, github, or gitlab.
 * @property {Boolean} [force=false] - If true, always ignore local cache and download from hosting service.
 * @property {Function} [onData] - Function to invoke when data is recieved during download, useful for showing progress bars. Called with the chunk and content-length header.
 */

/**
 *
 * @param {string} uri - The uri for the git repo.
 * @param {TarGitOptions} [options] - Various options to configure targit.
 */
async function download(
	uri,
	{ archiveType = 'tar.gz', cacheDir = defaultCache, defaultHost = 'github', force = false, onData } = {}
) {
	if (!uri || typeof uri !== 'string') {
		throw new TypeError('Expected uri to be a string');
	}

	if (!supportedHosts.includes(defaultHost)) {
		throw new TarGitError(`${defaultHost} is an unsupported host. Valid hosts are ${supportedHosts.join(', ')}`, {
			code: 'E_UNSUPPORTED_HOST'
		});
	}

	if (![ 'tar.gz', 'zip' ].includes(archiveType)) {
		throw new TarGitError(`${archiveType} is an unsupported archive type. Valid types are tar.gz and zip`, {
			code: 'E_UNSUPPORTED_ARCHIVE_TYPE'
		});
	}

	const repoInfo = parseURI(uri, defaultHost);
	const archiveDir = getArchiveDir(repoInfo, cacheDir);
	await ensureDir(archiveDir);
	const type = archiveType === 'zip' ? 'zip' : 'tgz';

	// Lookup the refs remotely via api, falling back to the on disk cache
	// if we fail
	let refs = await getRefs(repoInfo, archiveDir);
	let hash = getHash(repoInfo, refs);

	// If we can't find a hash and the ref is 'master', try and look up a ref of 'main' instead
	// this is due to a number of projects renaming their master branch to main and GitHub also
	// changing the default
	if (!hash && repoInfo.ref === 'master') {
		Object.assign(repoInfo, parseURI(`${uri}#main`, defaultHost));
		refs = await getRefs(repoInfo, archiveDir);
		hash = getHash(repoInfo, refs);
	}

	if (!hash) {
		throw new TarGitError('Could not find commit sha', {
			code: 'E_NO_REF'
		});
	}

	// Write out object of refs so we can handle somethings offline
	const archiveLocation = join(archiveDir, `${hash}.${archiveType}`);
	const refLocation = join(dirname(archiveLocation), 'refs.json');
	await writeJSON(refLocation, refs);

	// If it already exists just resolve with the location
	if (!force && await exists(archiveLocation)) {
		return archiveLocation;
	}

	// Otherwise download and resolve once done
	const req = requestFile({ url: repoInfo.archives[type] });

	return new Promise((resolve, reject) => {
		req
			.on('response', (response) => {
				if (response.statusCode !== 200) {
					throw new Error(`Failed to download archive: ${response.statusCode}`);
				}
				const length = parseInt(response.headers['content-length']);
				if (onData) {
					response.on('data', (chunk) => onData(length, chunk));
				}
				response.once('end', () =>  {
					resolve(archiveLocation);
				});
			})
			.once('error', reject)
			.pipe(createWriteStream(archiveLocation));
	});
}

/**
 *
 * @param {string} from - Item to extract.
 * @param {string} to - Location to extract to.
 */
async function extract (from, to) {

	if (!from || typeof from !== 'string') {
		throw new TypeError('Expected from to be a string');
	}

	if (!await exists(from)) {
		throw new TarGitError(`Archive location ${from} does not exist`, {
			code: 'E_ARCHIVE_NO_EXIST'
		});
	}

	try {
		const contents = await readdir(to);
		if (contents.length > 0) {
			throw new TarGitError(`Extract location ${to} is not empty`, {
				code: 'E_EXTRACT_DIR_NOT_EMPTY'
			});
		}
	} catch (err) {
		// ENOENT is fine as we'll make it
		if (err.code !== 'ENOENT') {
			throw err;
		}
	}

	await ensureDir(to);

	await decompress(from, to, { strip: 1 });
	return to;
}

/**
 *
 * @param {string} uri - URI of the git repo to download.
 * @param {string} to - Location to extract the git repo to.
 * @param {TarGitOptions} [options] - Various options to configure targit.
 * @returns {string} Location that the repo was extracted to.
 */
async function downloadAndExtract (uri, to, options = {}) {
	const  repoInfo = parseURI(uri, options.defaultHost);
	try {
		await request({ url: repoInfo.url });
	} catch (error) {
		// ENOTFOUND is passed through
		if (error.code === 'HTTPError') {
			// throw error
			throw new TarGitError(`Repo lookup failed ${repoInfo.url}, ${error.statusCode} ${error.statusMessage}`, {
				code: 'E_REPO_LOOKUP_FAILED',
				originalError: error
			});
		}
	}
	const downloadLocation = await download(uri, options);
	return extract(downloadLocation, to);
}

module.exports = {
	defaultCache,
	download,
	downloadAndExtract,
	extract,
	parseURI,
	TarGitError
};
