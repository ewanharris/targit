
const { TarGitError } = require('../src/utils');

test('TarGitError', () => {
	const err = new TarGitError('Have message', { props: true });
	expect(err.message).toBe('Have message');
	expect(err.props).toBe(true);
});
