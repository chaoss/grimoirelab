# Docker images for GrimoireLab

This file describes some docker images that are useful when
deploying GrimoireLab in containers:

* `grimoirelab/factory`: a "factory" container for GrimoireLab, produces
(and tests, if needed) GrimoireLab pacakges from their
git repositories.

* `grimoirelab/installed`: a "preinstalled" container for GrimoireLab,
contains all libraries and programs for a certain release, and
executes mordred by default.

* `grimoirelab/full`: a "fully preinstalled" container for GrimoireLab,
contains everything in `grimoirelab/installed` plus the services
needed to produce a dashboard: Elasticsearch, MariaDB, and Kibiter.

The `installed` and `full` can be easily used to produce a complete dashboard
from scratch, and in fact both configured by default for producing one
for GrimoireLab repositories (see below).

There are also some ansible playbooks for building the containers:

* `ansible_release.yml`: for building containers and pip
packages for a release of grimoirelab.

* `ansible_build_tag.yml`: for building a docker image, and tagging it
with the release tag.

* `ansible_push.yml`: for pushing docker images to DockerHub

## grimoirelab/factory

`grimoirelab/factory` is a Docker image intended for producing GrimoireLab
package distributions. It's definition is in `Dockerfile-factory`.
For creating the image type, while in the root of this repository
(notice the `.` at the end of the line):

```bash
$ docker build -f docker/Dockerfile-factory -t grimoirelab/factory .
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
  You also need to be careful with permissions:
  ensure that the user that runs the `docker` command
  has permissions to write in the `dist` directory.

* Build the release specified by the `/release` file in the docker container,
and write them to the `dist` directory (visible outside the container):

```bash
$ mkdir dist
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
in the container to some directory outside it (but be sure you
create it with the same user that will run the docker command):

```bash
$ mkdir dist logs
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
$ mkdir dist logs
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
$ docker build -f docker/Dockerfile-installed -t grimoirelab/installed .
```

If the image is run as such, it will produce a dashboard,
assuming Elasticsearch is available in port 9200, and MariaDB or MySQL
in their standard port (if they are not present, the process will fail).
Since the default configuration for Mordred in the container
includes repositories in GitHub, you need to specify your GitHub
token overriding the `/override.cfg` file with `mytoken.cfg`,
with the following content (XXX should be substituted by a real token):

```
[github]
api-token = XXX
```

And it will be run as:


```bash
$ docker run --net="host" \
    -v $(pwd)/mytoken.cfg:/override.cfg \
    grimoirelab/installed
```

It is convenient to see the logs written by mordred while
producing the dashboard. Those are produced within the container,
in the `/logs` directory. To make them available in the host,
just map that directory to a host directory:

```bash
$ docker run --net="host" \
    -v $(pwd)/mytoken.cfg:/override.cfg \
    -v $(pwd)/logs:/logs \
    grimoirelab/installed
```

If the default configuration is not appropriate, for example because
the database ports or credentials are not the ones used,
the infrastructure configuration file can be overridden:

```bash
$ docker run --net="host" \
    -v $(pwd)/mytoken.cfg:/override.cfg \
    -v $(pwd)/logs:/logs \
    -v $(pwd)/infra-local.cfg:/infra.cfg \
    grimoirelab/installed
```

If you also want to override the list of repositories to analyze,
you need to map the `/projects.json` file in the container:

```bash
$ docker run --net="host" \
    -v $(pwd)/mytoken.cfg:/override.cfg \
    -v $(pwd)/logs:/logs \
    -v $(pwd)/infra-local.cfg:/infra.cfg \
    -v $(pwd)/myprojects.json:/projects.json \
    grimoirelab/installed
```

You can also override the `menu.yaml` file,
to have a custom menu for your dashboard:

```bash
$ docker run --net="host" \
    -v $(pwd)/mytoken.cfg:/override.cfg \
    -v $(pwd)/logs:/logs \
    -v $(pwd)/infra-local.cfg:/infra.cfg \
    -v $(pwd)/myprojects.json:/projects.json \
    -v $(pwd)/mymenu.yaml:/menu.yaml \
    grimoirelab/installed
```

## grimoirelab/full

`grimoirelab/full` is a container based on `grimoirelab/installed`,
which therefore includes GrimoireLab, but also all the services
needed to produce a GrimoireLab dashboard: Elasticsearch, MariaDB,
and Kibana. As is, it will produce a dashboard for the GrimoireLab
project.

To try it, you can just run it as follows:

```bash
$ docker run -p 127.0.0.1:5601:5601 \
    -v $(pwd)/mytoken.cfg:/override.cfg \
    -t grimoirelab/full
```

`myytoken.cfg` should have a GitHub API token, in a `mordred.cfg`
format, as explained above. Let's repeat it here:

```
[github]
api-token = XXX
```

This will pull the `grimoirelab/full` Docker container image from DockerHub
(if it is not already in the local host), and will run it.
Upon running it, the container will launch Elasticsearch, MariaDB, and Kibana,
so they will be ready when the container launches Mordred to produce
a complete GrimoireLab dashboard. With the default configuration,
a dashboard for the GrimoireLab project will be produced. Once produced,
you can just point your browser to http://localhost:5601 and voila.

The `docker run` command line above exposed port 5601 in the container to
be reachable from the host, as `localhost:5601`. If you omit "127.0.0.1:",
it will be reachable to any other machine reaching your host, so be careful:
by default there is no access control in the Kibiter used by this container.

That line used the `mordred-local.cfg` file for the configuration for
Mordred. In fact, this will be the third configuration file in a chain for
Mordred. The other two can be substituted at runtime for different
configurations. The first one, `/mordred.cfg`,
has the general configuration for producing a dashboard for the
GrimoireLab project. It can be adapted to produce a dashboard for other
projects. The second one, `/mordred-full.cfg`, has the configuration
for reaching the services used by the container (ElasticSearch, MariaDB,
Kibiter), and is likely that you don't need to change it except if you
want to use some external service instead of those provided by the container.

A slightly different command line is as follows:

```bash
$ docker run -p 127.0.0.1:9200:9200 -p 127.0.0.1:5601:5601 \
    -p 127.0.0.1:3306:3306 \
    -v $(pwd)/mytoken.cfg:/override.cfg \
    -v $(pwd)/logs:/logs \
    -t grimoirelab/full
```

This one will expose also port `9200`, which corresponds to Elasticsearch,
and 3306, which corresponds to MariaDB.
This allows direct queries to the indexes and the tables stored
in both databases.
In addition,
it also mounts a local directory (`logs`) so that the container writes
Mordred logs in it. In case you want to access MariaDB, you can use
user `grimoirelab`.

By default, Elasticsearch will store indexes within the container image,
which means they are not persistent if the image shuts down. But you
can mount a local directory for Elasticsearch to write the indexes in
it. this way they will be available from one run of the image to the
next one. For example, to let Elasticsearch use directory `es-data`
to write the indexes:

```bash
$ docker run -p 127.0.0.1:9200:9200 -p 127.0.0.1:5601:5601 \
    -v $(pwd)/mytoken.cfg:/override.cfg \
    -v $(pwd)/logs:/logs \
    -v $(pwd)/es-data:/var/lib/elasticsearch \
    -t grimoirelab/full
```

You can also get a shell in the running container,
and run arbitrary GrimoireLab commands
(container_id is the identifier of the running container,
that you can find out with docker ps, or by looking at the first
line when running the container):

```
$ docker exec -it container_id env TERM=xterm /bin/bash
```

In the shell prompt you get, write any GrimoireLab command.
If you have mounted external files for the Mordred configuration,
you can modify them, and run Mordred again, to change its behaviour.

If you want to connect to the dashboard to issue your own commands,
but don't want it to run Mordred by itsef, run the container
setting `RUN_MORDRED` to `NO`:

```bash
$ docker run -p 127.0.0.1:9200:9200 -p 127.0.0.1:5601:5601 \
    -p 127.0.0.1:3306:3306 \
    -v $(pwd)/mytoken.cfg:/override.cfg \
    -v $(pwd)/logs:/logs \
    -v $(pwd)/es-data:/var/lib/elasticsearch \
    -e RUN_MORDRED=NO \
    -t grimoirelab/full
```

This will make the container launch all services, but not running `mordred`:
you can now use the container the way you may want,
getting a shell with `docker exec`.

**Warning** When Mordred is done, the container stays forever
(well, in fact for a long number of days), so that Kibana is
still available to produce the dashboard for your browser.
When you want to kill the container, it is not enough to just
type `<CTRL> C`, sice that will only kill the shell, but the services
on the background will stay. You will need to use `docker kill`
to kill the container.

You can also run GrimoireLab tests using this container,
using the variable `TEST`:

```bash
docker run -v$(pwd)/testconf:/testconf \
    -v$(pwd)/dist:/dist \
    -v$(pwd)/../releases/18.07-03:/release \
    -e TEST=YES \
    -t grimoirelab/full
```

This will run tests for all GrimoireLab packages with tests,
by cloning their repository, checking out the commit specified in `/release`,
copying to that repository the testing configuration files in `/testconf`,
if any, installing the dependencies (using GrimoireLab packages in `/dist`),
and running the tests in the repository
(using 'python setup.py test').

## Producing the default dashboard with grimoirelab/installed

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

Save this file under the name `mytoken.cfg`, and run:

```bash
$ docker run --net="host" \
    -v $(pwd)/mytoken.cfg:/override.cfg \
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
$ docker run --net="host" \
    -v $(pwd)/mytoken.cfg:/override.cfg \
    -v $(pwd)/logs:/logs \
    grimoirelab/installed
```

and, while the container runs, from a different window in the same
working directory, run:

```bash
$ tail -f $(pwd)/logs/all.log
```

You'll see how GrimoireLab produces everything needed.

## Producing GrimoireLab pip packages with grimoirelab/factory

This assumes that `releases/latest` points to the latest release file,
and that all commands are run from the root of the repository.

First, create the factory container (notice the dot at the end).

```
$ docker build -f docker/Dockerfile-factory -t grimoirelab/factory .
```

Then, run that container to produce the pip packages in the `docker/dist`
directory:

```
$ docker run \
    -v $(pwd)/docker/dist:/dist -v $(pwd)/docker/logs:/logs \
    grimoirelab/factory
```

If instead of the default release (`releases/latest`)
you want to run some other,
use the following line (in this case, to build `elasticgirl.29`):

```bash
$ docker run \
    -v $(pwd)/docker/dist:/dist \
    -v $(pwd)/docker/logs:/logs \
    -v $(pwd)/releases/elasticgirl.29:/release \
    grimoirelab/factory --build --install --check --relfile /release
```

# Producing grimoirelab/installed and grimoirelab/full

Now, with the packages in `docker/dist`, build
the `grimoirelab/installed` image, which contains those packages
already installed
(command run from the root of the repository, notice the dot at the end):

```bash
$ docker build -f docker/Dockerfile-installed -t grimoirelab/installed .
```

After it, you can also produce `grimoirelab/full`, which contains the
same, plus the servers needed to build a complete dashboard
(Elasticsearch, MariaDB, Kibiter):

```bash
$ docker build -f docker/Dockerfile-full -t grimoirelab/full .
```

Now, you can produce a dashboard for GrimoireLab, for testing that things
seem to work...

If you use `grimoirelab/full`, you will only need a GitHub token
in a configuration file, with the following format:

```
[github]
api-token = XXX
```

Save the file as `mytoken.cfg` and run the container image as:

```
$ docker run -p 127.0.0.1:5601:5601 \
    -v $(pwd)/mytoken.cfg:/override.cfg \
    -t grimoirelab/full
```

Now, point your web broser at `http://127.0.0.1:5601`,
and you should see the dashboard.

If you prefer to use `grimoirelab/installed`,
you need ElasticSearch, Kibiter/Kibana and MariaDB/MySQL
installed in the host, with data for accessing them in
`mordred-local.cfg`, and with your GitHub token
(you can see a template for that file as `docker/mordred-local.cfg`).

```
$ docker run --net="host" \
    -v $(pwd)/mytoken.cfg:/override.cfg \
    grimoirelab/installed
```

## Testing containers behind a proxy

If the container is separated from the Internet by a proxy, it will be necesary to tell the container where the proxy is. This is done via environment variables. For testing the container works behind a proxy, the following set up can be used:

* Launch a proxy server (squid) to test (of course, if a proxy server is already available, this step can be skipped), available in port 3128:

```
$ docker run -d -p 3128:3128 datadog/squid
```

* Launch the `grimoirelab/full` container with environment variables pointing to where the proxy is listening. Be careful of using the IP or host name of the host where the proxy is, not `localhost` (even if the proxy is running in localhost), since locahost needs to be reached directly, without proxying, to access Elasticsearch, MariaDB and Kibiter in the container (see 'no_proxy` variable):

```
$ docker run -p 127.0.0.1:5601:5601 \
    -v $(pwd)/mytokenn.cfg:/override.cfg \
    -e http_proxy=http://163.117.69.195:3128/ \
    -e https_proxy=http://163.117.69.195:3128/ \
    -e no_proxy="localhost,127.0.0.1" \
    -t grimoirelab/full
```

## Building with Ansible

We also have some Anslible play books for building and testing Python
packages.

### Build packages, container images, and push to Pypi and DockerHub

To build GrimoireLab 18.06-02 pip packages, Docker container images, and
push them to Pypi and DockerHub:

```bash
$ ansible-playbook ansible_release.yml --extra-vars "18.06-02"
```

### Build packages and container images for master HEAD

To build packages for all GrimoireLab modules, and the standard container images,
using the latest version in master for all GrimoireLab git repositories:

```bash
$ ANSIBLE_STDOUT_CALLBACK=debug ansible-playbook ansible_release.yml \
  --extra-vars "release=latest" --tags "build"
```

This will include testing all GrimoireLab modules for which testing is
supported in the `build_grimoirelab` script (see below).

The environment variable `ANSIBLE_STDOUT_CALLBACK=debug` will make
`\n` be interpreted as a newline in the output, so that it will be much more
readable for humans.

### Running tests on built packages

Once the packages have been built, tests can be run on them
(although the usual building includes testing):

```bash
$ ANSIBLE_STDOUT_CALLBACK=debug ansible-playbook ansible_release.yml \
  --extra-vars "release=18.07-03 FAIL=NO" --tags "test"
```

This will get checkouts from all GrimoireLab git repositories,
for which tests are supported,
corresponding to the commits specified in the release file for `18.07-03`,
and will run the tests for them (running `setup.py test`).
Tests will not make the full script fail, even if some test fail,
because of `FAIL=NO`, which will cause `--fail` to be used when calling
`build_grimoirelab`.