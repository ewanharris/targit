exports.parseURI = function (uri, defaultHost = 'github') {
	const match = /^(?:https:\/\/([^/]+)\/|git@([^/]+):|([^/]+):)?([^/\s]+)\/([^/\s#]+)(?:#(.+))?/.exec(uri);
	if (!match) {
		throw new Error(`Could not parse ${uri}`);
	}

	const site = (match[1] || match[2] || match[3] || defaultHost).replace(/^www\.|\.(com|org)$/g, '');

	const user = match[4];
	const name = match[5].replace(/\.git$/, '');
	const ref = match[6] || 'master';

	let url;
	if (site === 'bitbucket') {
		url = `https://${site}.org/${user}/${name}`;
	} else {
		url = `https://${site}.com/${user}/${name}`;
	}

	return {
		name,
		ref,
		site,
		user,
		url
	};
};
