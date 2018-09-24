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
	const { readFileSync } = require('fs');
	const { join } = require('path');
	let refs;
	try {
		refs = await getRemoteRefs(info);
	} catch (e) {
		try {
			console.log(e);
			refs = JSON.parse(readFileSync(join(archiveDir, 'refs.json')));
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
			let { body: bbBody } = await request(`https://api.bitbucket.org/2.0/repositories/${user}/${repo}/refs`, { json: true });
			for (const bbRef of bbBody.values) {
				refsData[bbRef.name] = bbRef.target.hash;
			}
			break;
		case 'github':
			const headers = {
				Accept: 'application/vnd.github.v3+json'
			};

			if (process.env.GH_TOKEN) {
				headers.Authorization = `token ${process.env.GH_TOKEN}`;
			}
			const { body: ghBody } = await request(`https://api.github.com/repos/${user}/${repo}/git/refs`, {
				headers,
				json: true
			});
			// TODO handle rate limit
			for (const ghRef of ghBody) {
				refsData[ghRef.ref.replace('refs/heads/', '')] = ghRef.object.sha;
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
