const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
const rimraf = require('rimraf');
const { download, extract } = require('../src');

describe('download', () => {

	// TODO: Error stuff

	// TODO: replace these with proper test repos

	test('should download a repo master tar.gz', async () => {
		const tmpDir = tmp.dirSync({
			mode: '755',
			prefix: 'targit-download-test'
		});
		const dir = await download('ewanharris/targit-test-repo', { cacheDir: tmpDir.name });
		expect(dir).toBe(path.join(tmpDir.name, 'github', 'ewanharris', 'targit-test-repo', 'e636f1a0a8788c79300024b2c029696a75af33d7.tar.gz'));
		expect(fs.existsSync(dir)).toBe(true);
		rimraf.sync(tmpDir.name);
	});

	test('should download a repos master zip', async () => {
		const tmpDir = tmp.dirSync({
			mode: '755',
			prefix: 'targit-download-test'
		});
		const dir = await download('ewanharris/targit-test-repo', { cacheDir: tmpDir.name, archiveType: 'zip' });
		expect(dir).toBe(path.join(tmpDir.name, 'github', 'ewanharris', 'targit-test-repo', 'e636f1a0a8788c79300024b2c029696a75af33d7.zip'));
		expect(fs.existsSync(dir)).toBe(true);
		rimraf.sync(tmpDir.name);
	});

	test('should download a repos tag zip', async () => {
		const tmpDir = tmp.dirSync({
			mode: '755',
			prefix: 'targit-download-test'
		});
		const dir = await download('ewanharris/targit-test-repo#v1.0.0', { cacheDir: tmpDir.name });
		expect(dir).toBe(path.join(tmpDir.name, 'github', 'ewanharris', 'targit-test-repo', 'e636f1a0a8788c79300024b2c029696a75af33d7.tar.gz'));
		expect(fs.existsSync(dir)).toBe(true);
		rimraf.sync(tmpDir.name);
	});
});

describe('extract', () => {

	test('should error if passed incorrect args', async () => {

		await expect(extract())
			.rejects
			.toThrow('Expected from to be a string');

		await expect(extract({ from: true }))
			.rejects
			.toThrow('Expected from to be a string');

	});
	test('should error if from does not exist', async () => {
		await expect(extract({ from: path.join(__dirname, 'no-exist') }))
			.rejects
			.toThrow(`Archive location ${path.join(__dirname, 'no-exist')} does not exist`);
	});
});
