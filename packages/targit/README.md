# targit

A library for figuring out the download links for hosted Git services (Bitbucket, GitHub, GitLab).

# Installation

```sh
npm install --save targit
```

# Usage overview

The simplest usage for this module is to call `downloadAndExtract`. It will handle everything for your, from parsing the URI, downloading the archive, and then extracting it to the requested location.

```js
const { downloadAndExtract } = require('targit');

await downloadAndExtract('ewanharris/targit', '/a/location')

// or configure targit by passing a third option see TarGitOptions for full options

await downloadAndExtract('ewanharris/targit', '/a/location', {
	defaultHost: 'gitlab' // download from gitlab
})
```

If you want to do some custom behaviour the different pieces of that function are available as the following exports:
- `parseURI` 
    - A re-export of targit-parser)
- `download` 
    - The download logic
- `extract`
    - The extraction logic

Full API details below.

-   [defaultCache][1]
-   [TarGitOptions][2]
    -   [Properties][3]
-   [download][4]
    -   [Parameters][5]
-   [extract][6]
    -   [Parameters][7]
-   [downloadAndExtract][8]
    -   [Parameters][9]

## defaultCache

The default cache location for targit.

Type: [string][10]

## TarGitOptions

Options that can be used to configure targit.

Type: [Object][11]

### Properties

-   `archiveType` **[string][10]?** Archive format to download, zip or tar.gz.
-   `cacheDir` **[string][10]?** Top level directory to cache downloads in.
-   `defaultHost` **[string][10]?** Default host to be used when parsing the uri, bitbucket, github, or gitlab.
-   `force` **[Boolean][12]?** If true, always ignore local cache and download from hosting service.
-   `onData` **[Function][13]?** Function to invoke when data is recieved during download, useful for showing progress bars. Called with the chunk and content-length header.

## download

### Parameters

-   `uri` **[string][10]** The uri for the git repo.
-   `options` **[TarGitOptions][14]?** Various options to configure targit. (optional, default `{}`)
    -   `options.archiveType`   (optional, default `'tar.gz'`)
    -   `options.cacheDir`   (optional, default `defaultCache`)
    -   `options.defaultHost`   (optional, default `'github'`)
    -   `options.force`   (optional, default `false`)
    -   `options.onData`  

## extract

### Parameters

-   `from` **[string][10]** Item to extract.
-   `to` **[string][10]** Location to extract to.

## downloadAndExtract

### Parameters

-   `uri` **[string][10]** URI of the git repo to download.
-   `to` **[string][10]** Location to extract the git repo to.
-   `options` **[TarGitOptions][14]?** Various options to configure targit. (optional, default see **[TarGitOptions][14]** for defaults)

Returns **[string][10]** Location that the repo was extracted to.

[1]: #defaultcache

[2]: #targitoptions

[3]: #properties

[4]: #download

[5]: #parameters

[6]: #extract

[7]: #parameters-1

[8]: #downloadandextract

[9]: #parameters-2

[10]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[11]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

[12]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean

[13]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function

[14]: #targitoptions

##### Exceptions

The following exceptions are thrown by targit (and are instances of TarGitError)

- E_ARCHIVE_NO_EXIST - Provided archive location to extract does not exist
- E_EXTRACT_DIR_NOT_EMPTY - Directory to extract to has contents.
- E_NO_REF - Could not find the commit sha for the provided URI.
- E_PARSE_FAIL - Failed to parse the provided URI.
- E_REPO_LOOKUP_FAILED - Failed to lookup the repository represented by the provided URI.
- E_UNSUPPORTED_ARCHIVE_TYPE - Unsupported archive type was provided.
- E_UNSUPPORTED_HOST - Unsupported host was provided.

# Acknowledgements

This library is built thanks to the following projects:

- [degit](https://github.com/Rich-Harris/degit) by [Rich Harris](https://github.com/Rich-Harris)
- [gittar](https://github.com/lukeed/gittar) by [Luke Edwards](https://github.com/Rich-Harris)
