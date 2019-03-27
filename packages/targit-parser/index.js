/**
 * Parse a URI to return various pieces of information
 *
 * @param {String} uri - The URI to be parsed.
 * @param {String} [defaultHost='github'] - The host to default to when parsing a URI.
 *
 * @returns {Object}
 */
module.exports = function parseURI(uri, defaultHost = 'github') {
	const match = /^(?:https:\/\/([^/]+)\/|git@([^/]+):|([^/]+):)?([^/\s]+)\/([^/\s#]+)(?:#(.+))?/.exec(uri);

	if (!match) {
		throw new TarGitError(`Could not parse ${uri}`, {
			code: 'E_PARSE_FAIL'
		});
	}

	const site = (match[1] || match[2] || match[3] || defaultHost).replace(/^www\.|\.(com|org)$/g, '');

	const user = match[4];
	const repo = match[5].replace(/\.git$/, '');
	const ref = match[6] || 'master';
	const archives = {};

	let url;
	switch (site) {
		case 'bitbucket':
			url = `https://${site}.org/${user}/${repo}`;
			archives.tgz = `${url}/get/${ref}.tar.gz`;
			archives.zip = `${url}/get/${ref}.zip`;
			break;
		case 'gitlab':
			url = `https://${site}.com/${user}/${repo}`;
			archives.tgz = `${url}/repository/archive.tar.gz?ref=${ref}`;
			archives.zip = `${url}/repository/archive.zip?ref=${ref}`;
			break;
		case 'github':
		default:
			url = `https://${site}.com/${user}/${repo}`;
			archives.tgz = `${url}/archive/${ref}.tar.gz`;
			archives.zip = `${url}/archive/${ref}.zip`;
			break;
	}

	return {
		repo,
		ref,
		site,
		user,
		url,
		archives
	};
};

class TarGitError extends Error {
	constructor(message, opts) {
		super(message);
		Object.assign(this, opts);
	}
}
