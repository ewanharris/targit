function getArchiveDir({ site, user, repo }, cacheDir) {
	const { join } = require('path');
	return join(cacheDir, site, user, repo);
}

class TarGitError extends Error {
	constructor(message, opts) {
		super(message);
		Object.assign(this, opts);
	}
}

async function getRefs(info, archiveDir) {
	const { readJSON } = require('fs-extra');
	const { join } = require('path');
	let refs;
	try {
		refs = await getRemoteRefs(info);
	} catch (e) {
		try {
			refs = await readJSON(join(archiveDir, 'refs.json'));
		} catch (err) {
			refs = {};
		}
	}
	return refs;
}

function getHash(info, refs) {
	if (refs[info.ref]) {
		return refs[info.ref];
	}

	// Not a sha, so just return null
	if (info.ref.length < 8) {
		return null;
	}

	for (const ref of refs) {
		if (ref.hash.starsWith(info.ref)) {
			return ref;
		}
	}
}

async function getRemoteRefs({ site, user, repo }) {
	const { default: request } = require('@axway/amplify-request');

	const refsData = {};
	switch (site) {
		case 'bitbucket':
			let { body: bbBody } = await request({
				url: `https://api.bitbucket.org/2.0/repositories/${user}/${repo}/refs`,
				validateJSON: true
			});
			for (const bbRef of bbBody.values) {
				refsData[bbRef.name] = bbRef.target.hash;
			}
			break;
		case 'github':
			const headers = {
				Accept: 'application/vnd.github.v3+json',
				'User-Agent': 'targit by ewanharris'
			};

			// This allows users to work around the rate limit
			if (process.env.GH_TOKEN) {
				headers.Authorization = `token ${process.env.GH_TOKEN}`;
			}

			const { body: ghBody } = await request({
				url: `https://api.github.com/repos/${user}/${repo}/git/refs`,
				headers,
				validateJSON: true,
			});

			for (const { object, ref } of ghBody) {
				refsData[ref.replace(/refs\/\w+\//, '')] = object.sha;
			}
			break;
		case 'gitlab':
			// nothing yet
			break;
	}
	return refsData;

}

module.exports = {
	getArchiveDir,
	getHash,
	getRefs,
	TarGitError
};
