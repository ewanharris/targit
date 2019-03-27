const { CLI } = require('cli-kit');
const { version } = require('../package.json');
const { downloadAndUnzip } = require('targit');

const cli = new CLI({
	args: [
		{
			name: '<repo>',
			desc: 'repo to clone',
			type: 'string'
		},
		{
			name: '[location]',
			desc: 'location to clone the repo to, if not specified clones to the current working directory',
			type: 'string'
		}
	],
	options: {
		'--service-name [value]': {
			desc: 'hosting service for the Git repo. Valid values are bitbucker, github, and gitlab',
			default: 'github'
		},
		'--archive-type [value]': {
			desc: 'archive type to download repo in. Valid values are zip and tar.gz',
			default: 'tar.gz'
		}
	},
	version
});

cli.exec()
	.then(async ({ argv }) => {
		const { repo, location, serviceName, archiveType } = argv;
		try {
			const place = await downloadAndUnzip(repo, location, { archiveType, defaultHost: serviceName });
			console.log(place);
		} catch (error) {
			console.error(error);
			switch (error.code) {
				case 'E_PARSE_FAIL':
					console.error(`Failed to parse ${repo}`);
					break;
				case 'ENOTFOUND':
					// Should handle this and default to offline
					break;
				case 'HTTPError':
					// console.error(`${error.statusCode} ${error.statusMessage} error when accessing ${repoInfo.url}`);
					console.error('Please ensure the provided uri is correct and that defaultHost is correct');
					break;
			}
		}
		return;
	})
	.catch(error => {
		console.error(error);
	});
