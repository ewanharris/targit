const { download } = require('./src');

download('ewanharris/targit')
	.then(dir => {
		console.log(dir);
	});
