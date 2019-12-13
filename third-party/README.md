# Directory for third party stuff

This directory is for configuration files, data, documentation, etc,
related to third party tools useful (or in some cases, needed)
by GrimoireLab or some of the GrimoireLab tools.

## Docker image grimoirelab/fossology-factory

This image is for building the
[Debian packages that are being produced in the Debian mentor program](https://mentors.debian.net/package/fossology).
They are built from source code.
For building them, we create a Docker image
(`grimoirelab/fossology-factory`) and then run it:

```bash
$ docker build -f Dockerfile-fossology -t grimoirelab/fossology-factory .
$ docker run -v $(pwd)/build:/build -t grimoirelab/fossology-factory
```

As a result, all packages (source and binary) are in the build directory.

## Docker image grimoirelab/full-3p

This is a decendent image from grimoirelab/full, with third party tools in it (e.g., nomos, cloc). For instance,
nomos is obtained via the installation of the fosssology-nomos package built with `grimoirelab/fossology-factory`:

```
docker build -f Dockerfile-grimoirelab-3p -t grimoirelab/full-3p .
```
