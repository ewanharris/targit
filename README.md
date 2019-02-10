### targit

targit is a module for downloading Git repostitories from a variety of hosting services. Currently targit supports BitBucket, GitHub, and GitLab (but not the on-premise versions).

This repo comprises of 3 packages:

* [targit](packages/targit)
	* The main library, majority of the time you'll want to use this
* [targit-cli](packages/targit-cli)
	* A WIP CLI that aims to provide an interesting of method of scaffolding projects.
* [targit-parser](packages/targit-parser)
	* The parser for various types of Git URIs supported by targit
