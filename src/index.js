const { parseURI } = require('./utils');

const supportedHosts = [
	'bitbucket',
	'github',
	'gitlab'
]

function fetchRepo(url, { defaultHost } = {}) {

	if (!url || typeof url !== 'string') {
		throw new TypeError('Expected url to be a string');
	}

	if (defaultHost && !supportedHosts.includes(defaultHost)) {
		const err =  new Error(`${defaultHost} is an unsupported host. Valid hosts are ${supportedHosts.join(', ')}`);
		err.code = 'E_UNSUPPORTED_HOST';
		throw err;
	}

	const info = parseURI(uri, defaultHost);
}

module.exports = fetchRepo;
