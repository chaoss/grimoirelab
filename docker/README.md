# Docker images for GrimoireLab

This file describes two docker images that are useful when
deploying GrimoireLab in containers:

* `grimoirelab/factory`: a "factory" container for GrimoireLab, produces
(and tests, if needed) GrimoireLab pacakges from their
git repositories.

* `grimoirelab/installed`: a "preinstalled" container for GrimoireLab,
contains all libraries and programs for a certain release, and
executes mordred by default.

The second one can be easily used for producing a complete dashboard
from scratch, and in fact is configured by default for producing one
for GrimoireLab repositories (see below).

## grimoirelab/factory

`grimoirelab/factory` is a Docker image intended for producing GrimoireLab
package distributions. It's definition is in `Dockerfile-factory`.
For creating the image type, while in this `docker` directory
(notice the `.` at the end of the line):

```bash
$ docker build -f Dockerfile-factory -t grimoirelab/factory .
```

If the image is run as such, it will try to compile GrimoireLab packages
using the last commit in the master branch of each of the GrimoireLab
git repositories. After building them, it will try to install them,
and run some checks on them.
All of this will be done in the container, which is ephemeral by nature.
Below we will see more interesting cases.
But still, this is a good example to test the machinery. To run it that way:

```bash
$ docker run grimoirelab/factory
```

Under the hood, the container is running
[build_grimoirelab](../utils/build_grimoirelab)
with the following default arguments:

* `--distdir /dist -l debug --logfile /logs/build.log`:
produce the distributable packages in /dist (within the container),
and write logs, debug level, in `/logs/build.log` (again, within the container)

* `--build --install --check`: build the packages, then install them,
then run some checks on them

The former arguments are always the same (but see below, they
  can be overridden using `--entrypoint`). The later can be
  overridden when running the container from the command line.

For example, for just building (instead of also installing and checking):

```bash
$ docker run grimoirelab/factory --build
```

`--build` will override the default `--build --install --check`

When running the command from the command line, we can also benefit
of some files and directories that are within the container, in
several ways. The most interesting ones are:

* `/release`: a file with a GrimoireLab release file, usually the
latest one when the container was produced

* `/dist`: a directory ready to receive the distributable packages

* `/logs`: a directory where the log file `build.log` will be written
with the details of the process.

Using them, we can for example:

* Build packages corresponding to the last commit in the master branch
in all GrimoireLab repos, and write them to the `dist` directory
(so that now we can get them outside the container):

```bash
$ docker run -v $(pwd)/dist:/dist grimoirelab/factory --build
```

It is important that you write `$(pwd)/dist:/dist`
as such, or by using a full real path for `$(pwd)/dist`, except
that you know well what you do: docker is very picky about names
for files and directories in that context.
Of course, the trick to make the container produce the packages
outside the container was to map the internal `/dist` directory
in the container to `$(pwd)/dist` outside the container
(that is, the `dist` directory in the current directory, which
  should be this `docker` directory).

* Build the release specified by the `/release` file in the docker container,
and write them to the `dist` directory (visible outside the container):

```bash
$ docker run -v $(pwd)/dist:/dist \
    grimoirelab/factory --build --relfile /release
```

This will produce all packages for the corresponding release in the
`dist` directory. It is important that you write `$(pwd)/dist:/dist`
as such, or by using a full real path for `$(pwd)/dist`, except
that you know well what you do: docker is very picky about names
for files and directories in that context.

* If you are interesting in checking the logs produced during building,
installing and/or checking the files, map the `/logs` directory
in the container to some directory outside it:

```bash
$ docker run \
    -v $(pwd)/dist:/dist \
    -v $(pwd)/logs:/logs \
    grimoirelab/factory --build
```

This will produce a `logs/build.log` file in the current directory,
with the log of the process followed by the container.

* If you want to build an specific release, map the
internal `/release` directory to release file outside the container:

```bash
$ docker run \
    -v $(pwd)/dist:/dist \
    -v $(pwd)/logs:/logs \
    -v $(pwd)/../releases/elasticgirl.21:/release \
    grimoirelab/factory --build --relfile /release
```

* You can even get the help for the `build_grimoirelab` command,
so that you can explore other arguments:

```bash
$ docker run grimoirelab/factory --help
```

By using the `--entrypoint` parameter to `docker run` you can also
run a shell instead of the command to build packages.
Then you can explore the image and even run the
`build_grimoirelab` command yourself:

```
$ docker run -it -v $(pwd)/dist:/dist --entrypoint /bin/bash \
    grimoirelab/factory
grimoirelab@5c19c82f7083:~$ pwd
/home/grimoirelab
grimoirelab@5c19c82f7083:~$ /usr/local/bin/build_grimoirelab --help
 ...
grimoirelab@5c19c82f7083:~$ exit
```

## grimoirelab/installed

`grimoirelab/installed` is a container preinstalled with
a certain release of GrimoireLab, including all libraries and
programas. By default it runs `mordred` for producing a dashboard,
given a mordred configuration file.

To produce the container, type (remember the dot at end of the line):

```bash
$ docker build -f Dockerfile-installed -t grimoirelab/installed .
```

If the image is run as such, it will try to produce a dashboard,
assuming Elasticsearch is available in port 9200, and MariaDB or MySQL
in their standard port (if they are not present, the process will fail).

```bash
$ docker run --net="host" grimoirelab/installed
```

It is convenient to see the logs written by mordred while
producing the dashboard. Those are produced within the container,
in the `/logs` directory. To make them available in the host,
just map that directory to a host directory:

```bash
$ docker run --net="host" -v $(pwd)/logs:/logs grimoirelab/installed
```

If the default configuration is not appropriate, for example because
the database ports or credentials are not the ones used,
the local configuration file can be overridden:

```bash
$ docker run --net="host" -v $(pwd)/logs:/logs \
    -v $(pwd)/mordred-local.cfg:/mordred-local.cfg \
    grimoirelab/installed
```

If you also want to override the list of repositories to analyze,
you need to map the `/projects.json` file in the container:

```bash
$ docker run --net="host" -v $(pwd)/logs:/logs \
    -v $(pwd)/mordred-local.cfg:/mordred-local.cfg \
    -v $(pwd)/myprojects.json:/projects.json \
    grimoirelab/installed
```

You can also override the `menu.yaml` file,
to have a custom menu for your dashboard:

```bash
$ docker run --net="host" -v $(pwd)/logs:/logs \
    -v $(pwd)/mordred-local.cfg:/mordred-local.cfg \
    -v $(pwd)/myprojects.json:/projects.json \
    -v $(pwd)/mymenu.yaml:/menu.yaml \
    grimoirelab/installed
```

How jgb runs the container to produce a dashboard for GrimoireLab:

```bash
$ docker run --net="host" -v $(pwd)/logs:/logs \
    -v $(pwd)/mordred-local-jgb.cfg:/mordred-local.cfg \
    -v $(pwd)/projects-grimoirelab.json:/projects.json \
    grimoirelab/installed
```

## Producing the default dashboard

The `grimoirelab/installed` container is configured for producing
by default a dashboard for the GrimoireLab project. That means
that it already has in it the file `/projects.json` with the
list of GrimoireLab repositories (git and GitHub issues / pull requests),
and in the `/mordred.cfg` the Mordred configuration to produce
a version of the indexes and panels, assuming that you already have
access to working versions of Elasticsearch (with the accompanying Kibana
  or Kibiter) and MariaDB (or MySQL).

You will only need to produce a configuration file with the locations
and credentials of ElasticSearch and MariaDB, and an [API token for
GitHub](https://github.com/blog/1509-personal-api-tokens). For example,
this one, assuming Elasticsearch runs in localhost with no authentication
needed, MariaDB (used by SortingHat) in localhost too, with user `jgb`
and password `XXX`, and a GitHub API token `XXX` (which obviously is
  not a valid token, you will need to generate your own).

```
[es_collection]
url = http://localhost:9200
user =
password =

[es_enrichment]
url = http://127.0.0.1:9200
user =
password =

[sortinghat]
host = localhost
user = jgb
password = XXX
database = grimoirelab_sh

[github]
api-token = XXXXXX
```

Save this file under the name `/mordred-local-my.cfg`, and run:

```bash
$ docker run --net="host" -v $(pwd)/mordred-local-my.cfg:/mordred-local.cfg  \
    grimoirelab/installed    
.... [messages from Docker downloading the container]
Loading projects
Done
...
```

When the command finishes, some minutes later, you are done.
Point your browser to your Kibiter instance
(eg, [http://localhost:5601](http://localhost:5601/)),
and you'll see your shiny new dashboard.

If you want to see the logs generated by the different GrimoireLab
components while the container is working, create a `logs` directory
and run the container as follows:

```bash
$ docker run --net="host" -v $(pwd)/mordred-local-my.cfg:/mordred-local.cfg  \
    -v $(pwd)/logs:/logs \
    grimoirelab/installed
```

and, while the container runs, from a different window in the same
working directory, run:

```bash
$ tail -f $(pwd)/logs/all.log
```

You'll see how GrimoireLab produces everything needed.

## Producing GrimoireLab pip packages with these containers

This assumes that `docker/release` is a copy of `releases/latest`
(or the release file we want to produce).

First, create the factory container (notice the dot at the end).

```
$ docker build -f Dockerfile-factory -t grimoirelab/factory .
```

Then, run that container to produce the pip packages in the `dist`
directory:

```
$ docker run \
    -v $(pwd)/dist:/dist \
    -v $(pwd)/logs:/logs \
    grimoirelab/factory --build --relfile /release
```

If instead of the `docker/release` you want to run some other,
use the following line (builds `elasticgirl.27.1`):

```
$ docker run \
    -v $(pwd)/dist:/dist \
    -v $(pwd)/logs:/logs \
    -v $(pwd)/../releases/elasticgirl.27.1:/release \
    grimoirelab/factory --build --install --check --relfile /release
```

Now, with the packages in `dist`, build an installed image:

```
$ docker build -f Dockerfile-installed -t grimoirelab/installed .
```

And produce a dashboard for GrimoireLab, for testing that things
seem to work... This needs ElasticSearch, Kibana and MariaDB/MySQL
installed in the host, with data for accessing them in
`mordred-local-jgb.cfg`. You can see a template for that file
as `docker/mordred-local.cfg`.

```
$ docker run --net="host" -v $(pwd)/logs:/logs \
    -v $(pwd)/mordred-local-jgb.cfg:/mordred-local.cfg \
    grimoirelab/installed
```
