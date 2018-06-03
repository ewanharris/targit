# targit

A library for figuring out the download links for hosted Git services (Bitbucket, GitHub, GitLab).

# Installation

```sh
npm install --save targit
```

# Usage

```js
const obtainURL = require('targit');

obtainURL('ewanharris/targit').then(console.log);
// TODO: FIXME

obtainURL('ewanharris/targit', { cacheDir: '~/.my-cli/cache' }).then(console.log);
// TODO: FIXME
```

# API

### fetchGit(repo, options)

Returns: String

#### Behaviour:

Parse the repo name and look for a matching tarball on the filesystem. If no tarball exists then it will make a request to the correct Git hosting service to fetch the tarball, then cache it on disk at `~/.fetch-git` (or cacheDir).

#### repo

Type: String

The name, link or 

##### Exceptions

- ERR_INVALID_REPO - Thrown when a tarball URL can not be parsed from the repo string provided.

#### options.cacheDir

Type: String

Directory to cache tarballs in. If the cache dir does not exist then it will be created.

#### options.host

Type: String

The hostname (hosting service) that the repository resides in, if one exists in the repo string then that will be preferred.

##### Exceptions

- ERR_INVALID_HOST - Thrown when a host is deemed to not be supported, this is thrown even if there is a hostname in the repo string.


# Acknowledgements

This library is built thanks to the following projects:

- [degit](https://github.com/Rich-Harris/degit) by [Rich Harris](https://github.com/Rich-Harris)
- [gittar](https://github.com/lukeed/gittar) by [Luke Edwards](https://github.com/Rich-Harris)
