# Building GrimoireLab releases

Most people will use GrimoireLab releases, either as pip packages,
or embedded in Docker images. However, if you want to learn how
those packages and containers are built, this document explains it.

GrimoireLab releases are automatically generated from GitHub actions. Whenever we 
want to create a new release we run a [release workflow](.github/workflows/grimoirelab-release.yml). 
This workflow runs some jobs to check if Grimoirelab's dependencies 
have to generate a new release. To do this, it checks if there are new 
changelogs or any of its dependencies have been updated.

Version numbers and release notes are automatically generated using the 
unreleased changelog entries. It publishes the release in the Git 
repository creating a commit that will contain the new release notes and 
the new version files. A tag is also created with the new version number.

Packages are built with Poetry and uploaded to PyPI after successfully 
running the tests.

## building packages manually

Building a package manually is an easy process that only requires a few commands.

Package repositories are located at [src](src). These repositories are Git submodules
inside this repository, and by default are not downloaded when you clone the
repository, to do so, you  need to run the following commands to obtain the
latest version of each repository:
```
$ git clone https://github.com/chaoss/grimoirelab
$ cd grimoirelab
$ git submodule update --init --remote
```

### Increase version number
In case you want to increase the version number of a package, you can use
`semverup` from [release-tools](https://github.com/bitergia/release-tools).
It will increase the version according to semantic versioning and the type 
of changelog entries generated between releases. If there are changes, it will 
show something like the following output:
```
$ cd src/grimoirelab-perceval
$ semverup
0.21.0
```
If there aren't changes, it will output an error. You can always force a new
version with `--bump-version` option.

### Build a new package

To build new packages you just need to [install Poetry](https://python-poetry.org/docs/#installation).
To create a new package you need to run `poetry build`, it builds the 
source and wheels archives:
```
$ poetry build
$ ls dist
perceval-0.21.0-py3-none-any.whl  perceval-0.21.0.tar.gz
```
