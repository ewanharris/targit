const parseURI = require('../index');

const plainURLCases = [
	[ 'https://www.bitbucket.org/ewanharris/targit' ],
	[ 'https://bitbucket.org/ewanharris/targit' ],
	[ 'https://www.bitbucket.org/ewanharris/targit#abranch' ],
	[ 'https://bitbucket.org/ewanharris/targit#abranch' ],

	[ 'https://www.github.com/ewanharris/targit' ],
	[ 'https://github.com/ewanharris/targit' ],
	[ 'https://www.github.com/ewanharris/targit#abranch' ],
	[ 'https://github.com/ewanharris/targit#abranch' ],

	[ 'https://www.gitlab.com/ewanharris/targit' ],
	[ 'https://gitlab.com/ewanharris/targit' ],
	[ 'https://www.gitlab.com/ewanharris/targit#abranch' ],
	[ 'https://gitlab.com/ewanharris/targit#abranch' ],
];

const userRepoCases = [
	[ { uri: 'ewanharris/targit', host: 'bitbucket' } ],
	[ { uri: 'ewanharris/targit#abranch', host: 'bitbucket' } ],

	[ { uri: 'ewanharris/targit' } ],
	[ { uri: 'ewanharris/targit#abranch' } ],

	[ { uri: 'ewanharris/targit', host: 'gitlab' } ],
	[ { uri: 'ewanharris/targit#abranch', host: 'gitlab' } ],
];

const hostUserRepoCases = [
	[ 'bitbucket:ewanharris/targit' ],
	[ 'bitbucket:ewanharris/targit#abranch' ],

	[ 'github:ewanharris/targit' ],
	[ 'github:ewanharris/targit#abranch' ],

	[ 'gitlab:ewanharris/targit' ],
	[ 'gitlab:ewanharris/targit#abranch' ],
];

const gitHostRepoCases = [
	[ 'git@bitbucket.org:ewanharris/targit.git' ],

	[ 'git@github.com:ewanharris/targit.git' ],

	[ 'git@gitlab.com:ewanharris/targit.git' ],
];

describe('parseURI', () => {

	test('should throw if it can not parse the uri', () => {
		expect(function () {
			parseURI('');
		}).toThrowError(Error, 'Could not parse');
	});

	test.each(plainURLCases)(
		'https url: %s',
		(uri) => {
			const parsed = parseURI(uri);
			expect(parsed).toMatchSnapshot();
		}
	);

	test.each(userRepoCases)(
		'user/repo: %j',
		({ uri, host }) => {
			const parsed = parseURI(uri, host);
			expect(parsed).toMatchSnapshot();
		}
	);

	test.each(hostUserRepoCases)(
		'host:user/repo: %s',
		(uri) => {
			const parsed = parseURI(uri);
			expect(parsed).toMatchSnapshot();
		}
	);

	test.each(gitHostRepoCases)(
		'git@host:user/repo: %s',
		(uri) => {
			const parsed = parseURI(uri);
			expect(parsed).toMatchSnapshot();
		}
	);
});
