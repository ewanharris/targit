# targit-parser

`targit-parser` is a library that helps you parse various types of hosted Git services URIs. Currently Bitbucket, GitHub and GitLab are supported.

The following styles are supported:

* `https://<service-url>/<user>/<repo>` e.g `https://www.github.com/ewanharris/targit`
* `<user>/<repo>` e.g. `ewanharris/targit`
  * This style defaults to hosting on GitHub but a host can be passed in
* `service-provider:<user>/<repo>` e.g `'github:ewanharris/targit'`
* `git@<service-url>:<user>/<repo>.git` e.g `git@bitbucket.org:ewanharris/targit.git`

For all services an object of the following structure is returned

```js
{
  "archives": { // URLs that can be used to download the repository, note that this will only include the contents, so no .git folder will exist
    "tgz": "https://bitbucket.org/ewanharris/targit/get/master.tar.gz",
    "zip": "https://bitbucket.org/ewanharris/targit/get/master.zip",
  },
  "ref": "master", // git reference, for example the commit sha or branch name
  "repo": "targit", // repository name
  "site": "bitbucket", // hosting service the repository is hosted on
  "url": "https://bitbucket.org/ewanharris/targit", // https URL to the repository
  "user": "ewanharris", // repository owners account name
}
```

## Examples

```js
const parseURI = require('targit-parser');

parseURI('ewanharris/targit');

parseURI('ewanharris/targit', 'github'); // optionally takes a default host to use in the parsing

// targit-parser will throw an error if it fails to parse the given URI
try {
  parseURI('invalid-uri');
} catch (error) {
  if (error.code === 'E_PARSE_FAIL') {
    // targit-parser failed to parse the URI :(
  }
}
```

## License

MIT
