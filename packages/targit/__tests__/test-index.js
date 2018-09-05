const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
const rimraf = require('rimraf');
const { download, extract } = require('../src');
process.env.GH_TOKEN = '20d90e0ea38ef341de3413ef8311b049d074f4b7';

describe('download', () => {

	// TODO: Error stuff

	// TODO: replace these with proper test repos

	test('should download a repo master tar.gz', () => {
		const tmpDir = tmp.dirSync({
			mode: '755',
			prefix: 'targit-download-test'
		});
		return download('ewanharris/targit', { cacheDir: tmpDir.name })
			.then(dir => {
				expect(dir).toBe(path.join(tmpDir.name, 'github', 'ewanharris', 'targit', '1bd8254d87471532488385d27f61d6f3c4db7dee.tar.gz'));
				expect(fs.existsSync(dir)).toBe(true);
				rimraf.sync(tmpDir.name);
			});
	});

	test('should download a repos master zip', () => {
		const tmpDir = tmp.dirSync({
			mode: '755',
			prefix: 'targit-download-test'
		});
		download('ewanharris/targit', { cacheDir: tmpDir.name, archiveType: 'zip' })
			.then(dir => {
				expect(dir).toBe(path.join(tmpDir.name, 'github', 'ewanharris', 'targit', 'master.zip'));
				expect(fs.existsSync(dir)).toBe(true);
				rimraf.sync(tmpDir.name);
			});
	});

	test('should download a repos tag zip', () => {
		const tmpDir = tmp.dirSync({
			mode: '755',
			prefix: 'targit-download-test'
		});
		download('appcelerator/eslint-config-axway#v3.0.0', { cacheDir: tmpDir.name })
			.then(dir => {
				expect(dir).toBe(path.join(tmpDir.name, 'github', 'appcelerator', 'eslint-config-axway', 'v3.0.0.tar.gz'));
				expect(fs.existsSync(dir)).toBe(true);
				rimraf.sync(tmpDir.name);
			});
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
