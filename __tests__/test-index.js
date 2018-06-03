const fetchRepo = require('../src');
const { parseURI } = require('../src/utils');

const baseExpected = { name: 'targit', ref: 'master', user: 'ewanharris' };

const expectedBitbucket = Object.assign({}, baseExpected, { site: 'bitbucket', url: 'https://bitbucket.org/ewanharris/targit' });
const expectedBitbucketBranch = Object.assign({}, expectedBitbucket, { ref: 'abranch' });
const expectedGitHub = Object.assign({}, baseExpected, { site: 'github', url: 'https://github.com/ewanharris/targit' });
const expectedGitHubBranch = Object.assign({}, expectedGitHub, { ref: 'abranch' });
const expectedGitLab = Object.assign({}, baseExpected, { site: 'gitlab', url: 'https://gitlab.com/ewanharris/targit' });
const expectedGitLabBranch = Object.assign({}, expectedGitLab, { ref: 'abranch' });

const plainURLCases = [
	[ 'https://www.bitbucket.org/ewanharris/targit', expectedBitbucket ],
	[ 'https://bitbucket.org/ewanharris/targit', expectedBitbucket ],
	[ 'https://www.bitbucket.org/ewanharris/targit#abranch', expectedBitbucketBranch ],
	[ 'https://bitbucket.org/ewanharris/targit#abranch', expectedBitbucketBranch ],

	[ 'https://www.github.com/ewanharris/targit', expectedGitHub ],
	[ 'https://github.com/ewanharris/targit', expectedGitHub ],
	[ 'https://www.github.com/ewanharris/targit#abranch', expectedGitHubBranch ],
	[ 'https://github.com/ewanharris/targit#abranch', expectedGitHubBranch ],

	[ 'https://www.gitlab.com/ewanharris/targit', expectedGitLab ],
	[ 'https://gitlab.com/ewanharris/targit', expectedGitLab ],
	[ 'https://www.gitlab.com/ewanharris/targit#abranch', expectedGitLabBranch ],
	[ 'https://gitlab.com/ewanharris/targit#abranch', expectedGitLabBranch ],
];

const userRepoCases = [
	[ { uri: 'ewanharris/targit', host: 'bitbucket' }, expectedBitbucket ],
	[ { uri: 'ewanharris/targit#abranch', host: 'bitbucket' }, expectedBitbucketBranch ],

	[ { uri: 'ewanharris/targit' }, expectedGitHub ],
	[ { uri: 'ewanharris/targit#abranch'}, expectedGitHubBranch ],

	[ { uri: 'ewanharris/targit', host: 'gitlab' }, expectedGitLab ],
	[ { uri: 'ewanharris/targit#abranch', host: 'gitlab' }, expectedGitLabBranch ],
];

const hostUserRepoCases = [
	[ 'bitbucket:ewanharris/targit', expectedBitbucket ],
	[ 'bitbucket:ewanharris/targit#abranch', expectedBitbucketBranch ],

	[ 'github:ewanharris/targit', expectedGitHub ],
	[ 'github:ewanharris/targit#abranch', expectedGitHubBranch ],

	[ 'gitlab:ewanharris/targit', expectedGitLab ],
	[ 'gitlab:ewanharris/targit#abranch', expectedGitLabBranch ],
];

const gitHostRepoCases = [
	[ 'git@bitbucket.org:ewanharris/targit.git', expectedBitbucket ],

	[ 'git@github.com:ewanharris/targit.git', expectedGitHub ],

	[ 'git@gitlab.com:ewanharris/targit.git', expectedGitLab ],
]

describe('fetchRepo', () => {

	test('should error if passed incorrect args', () => {

		expect(function () {
			fetchRepo();
		}).toThrowError(TypeError, 'Expected url to be a string');

		expect(function () {
			fetchRepo(123);
		}).toThrowError(TypeError, 'Expected url to be a string');

		expect(function () {
			fetchRepo('astring', { defaultHost: 'foo' });
		}).toThrowError(Error, 'foo is an unsupported host. Valid hosts are bitbucket, github, gitlab');
	});
});

describe('utils', () => {

	describe('parseURI', () => {

		test('should throw if it can not parse the uri', () => {
			expect(function () {
				parseURI('');
			}).toThrowError(Error, 'Could not parse');
		});

		test.each(plainURLCases)(
			'https url: %s',
			(uri, expected) => {
				const parsed = parseURI(uri);
				expect(parsed).toStrictEqual(expected);
			}
		);

		test.each(userRepoCases)(
			'user/repo: %j',
			({ uri, host }, expected) => {
				const parsed = parseURI(uri, host);
				expect(parsed).toStrictEqual(expected);
			}
		);

		test.each(hostUserRepoCases)(
			'host:user/repo: %s',
			(uri, expected) => {
				const parsed = parseURI(uri);
				expect(parsed).toStrictEqual(expected);
			}
		);

		test.each(hostUserRepoCases)(
			'git@host:user/repo: %s',
			(uri, expected) => {
				const parsed = parseURI(uri);
				expect(parsed).toStrictEqual(expected);
			}
		);
	});
});
