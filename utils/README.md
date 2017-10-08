# Utils

Utils, general to GrimoireLab.

## build_grimoirelab

Build packages (sdist, wheel) for all modules in GrimoireLab.
This program can build the packages corresponding to a coordinated release
of GrimoireLab, or to the current master/HEAD of all repos.
The build can use virtual environments for building everything,
and can be installed for testing in a virtual environment too.
A set of modules to install can be selected, if not all want to be built.

Currently, this script can produce all packages for the repos that
already support Python packages,
and install them in a virtual environment where they could be tested.

To avoid problems with the Python installation in the host
where the packages are produced,
a virtual environment with installed dependencies for building is produced,
and packages are built in it.

The script accepts options to build or install, to select only a certain set of modules, to define directories for building and installing virtual environments, for the temporary repositories, for where to produce the Python packages, and to select a coordinated release file.

Examples:

* Build all modules in a coordinated release of GrimoireLab
(the one corresponding to `../releases/elasticgirl.16`),
producing the corresponding wheels and sdists in `/tmp/dist`,
and installing them in the virtual environment `/tmp/ivenv`
afterwards, including dependencies.
Write log file in `/tmp/log`, using log level `debug`.

```bash
$ build_grimoirelab -l debug --logfile /tmp/log --build --install \
  --relfile ../releases/elasticgirl.16  --distdir /tmp/dist --ivenv /tmp/ivenv
```

* Build the `grimoire-kidash` module, as is in the `master/HEAD` commit
of its repository,
producing the corresponding wheels and sdists in `/tmp/dist`.

```
$ build_grimoirelab --build --relfile ../releases/elasticgirl.16  \
  --distdir /tmp/dist  --modules grimoire-kidash
```

* Install modules available in `/tmp/dist` as wheels and sdists,
in the virtual environment `/tmp/ivenv`, including dependencies.

```
$ build_grimoirelab --install --distdir /tmp/dist --ivenv /tmp/ivenv \
  --modules grimoire-kidash
```

For complete list of arguments, run:

```bash
$ build_grimoirelab --help
```
