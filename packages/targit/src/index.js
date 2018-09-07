const got = require('got');
const decompress = require('decompress');
const parseURI = require('targit-parser');
const mkdirp = require('mkdirp');
const { createWriteStream, existsSync, readdirSync, writeFileSync } = require('fs');
const { dirname, join } = require('path');
const { getArchiveDir, getHash, getRefs, TarGitError } = require('./utils');
const { homedir } = require('os');
const { default: request, requestFile } = require('@axway/amplify-request');

const defaultCache = join(homedir(), '.targit');

const supportedHosts = [
	'bitbucket',
	'github',
	'gitlab'
];

/**
 *
 * @param {String} uri - The uri for the git repo.
 * @param {Object} [options] - Various options.
 * @param {String} [options.archiveType='tar.gz'] - Archive format to download, zip or tar.gz.
 * @param {String} [options.cacheDir='~/.targit'] - Top level directory to cache downloads in.
 * @param {String} [options.defaultHost='github'] - Default host to be used when parsing the uri, Bitbucket, GitHub, or GitLab.
 * @param {Boolean} [options.force=false] - If true, always ignore local cache and download from hosting service.
 * @param {Function} [options.onData] - Function to invoke when data is recieved during download, useful for showing progress bars. Called with the chunk and content-length header.
 * @returns {Promise} Resolves with the location of the archive once downloaded
 */
function download(
	uri,
	{ archiveType = 'tar.gz', cacheDir = defaultCache, defaultHost = 'github', force = false, onData } = {}
) {
	return new Promise(async (resolve, reject) => {
		if (!uri || typeof uri !== 'string') {
			throw new TypeError('Expected url to be a string');
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
		mkdirp.sync(archiveDir);
		const type = archiveType === 'zip' ? 'zip' : 'tgz';
		// Lookup the refs remotely via api, falling back to the on disk cache
		// if we fail
		const refs = await getRefs(repoInfo, archiveDir);
		const hash = getHash(repoInfo, refs);

		if (!hash) {
			throw new TarGitError('Could not find commit sha', {
				code: 'E_NO_REF'
			});
		}

		const archiveLocation = join(archiveDir, `${hash}.${archiveType}`);
		const refLocation = join(dirname(archiveLocation), 'refs.json');
		// Write out object of refs so we can handle somethings offline
		writeFileSync(refLocation, JSON.stringify(refs, null, '\t'));

		// If it already exists just resolve with the location
		if (!force && existsSync(archiveLocation)) {
			return resolve(archiveLocation);
		}
		// Otherwise download and resolve once done
		const req = requestFile({ url: repoInfo.archives[type] });

		req
			.on('response', (response) => {
				if (response.statusCode !== 200) {
					return reject(new Error(`Failed to download archive: ${response.statusCode}`));
				}
				const length = parseInt(response.headers['content-length']);
				if (onData) {
					response.on('data', (chunk) => onData(length, chunk));
				}
				response.once('end', () => resolve(archiveLocation));
			})
			.once('error', reject)
			.pipe(createWriteStream(archiveLocation));
	});
}

async function extract({ from, to = process.cwd() } = {}) {

	if (!from || typeof from !== 'string') {
		throw new TypeError('Expected from to be a string');
	}

	if (!existsSync(from)) {
		throw new TarGitError(`Archive location ${from} does not exist`, {
			code: 'E_ARCHIVE_NO_EXIST'
		});
	}
	try {
		const contents = readdirSync(to);
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

	mkdirp.sync(to);
	try {
		await decompress(from, to, { strip: 1 });
		return to;
	} catch (e) {
		throw e;
	}
}

async function downloadAndExtract (uri, to, opts = {}) {
	const  repoInfo = parseURI(uri, opts.defaultHost);
	try {
		await request(repoInfo.url);
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
	const downloadLocation = await download(uri, opts);
	return await extract({ from: downloadLocation, to });
}

module.exports = {
	defaultCache,
	download,
	downloadAndExtract,
	extract,
	parseURI
};
