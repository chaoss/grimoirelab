# Building & testing GrimoireLab releases

Most people will use GrimoireLab releases, either as pip packages,
or embedded in Docker images. However, if you want to learn how
those packages and containers are built, this document explains it.

The [releases](releases) directory has a file for each
GrimoireLab release. Those files include the list of commits
corresponding to each GrimoireLab repository for that specific release.
This way, it is easier to reproduce a release of the past, if that's needed.

The rest of the information needed to produce a release
(such as the list of repositories to consider) is embedded
in the [build_grimoirelab](utils/build_grimoirelab)

## pip packages using build_grimoirelab

For the latest GrimoireLab release, you can produce your
own packages (the latest GrimoireLab release is the one
specified in the `releases/latest` file):

```bash
$ git clone https://github.com/chaoss/grimoirelab
$ cd grimoirelab
$ utils/build_grimoirelab --build --dist /tmp/dist
```

If you want to run the tests after building the packages,
check for some stuff, etc, you can run this instead of the last line:

```bash
$ utils/build_grimoirelab --build --build --install --check --test \
  --dist /tmp/dist --confdir docker/testconf
```

## pip packages using a Docker container

To be written

## Docker container images

To be written

## pip packages and Docker images using Ansible

There is an Ansible playbook that can be used to build
all Python packages and all container images for a GrimoireLab release:
`ansible_release.yml`. You can run it as follows (from the docker directory,
being `18.09-02` the release to build):

```bash
$ pip install ansible
$ git clone https://github.com/chaoss/grimoirelab
$ cd grimoirelab/docker
$ ANSIBLE_STDOUT_CALLBACK=debug ansible-playbook ansible_release.yml \
  --extra-vars "RELEASE=18.09-02" --tags "build"
```

For running the playbook, you will need to have Docker installed.


## Producing your own GrimoireLab package releases

You will only need this if you want to produce your "own" release,
for example, for internal use in your own downstram repositories.
In any case, this is also the way "official" GrimoireLab releases are produced.

First of all, clone the [chaoss/grimoirelab](https://github.com/chaoss/grimoirelab) repository:

```bash
$ git clone https://github.com/chaoss/grimoirelab
$ cd grimoirelab
```

Now, produce your own release file, under the `releases` directory.
In our example, it will be `releases/18.07-11`.
You can use as a template the one for the latest official release.
Those files are very simple:
just set the commit you want to have for every git repo involved in a
GrimoireLab release. Have in mind that each of those commits should
change the version id for the packages produced from those repositories,
so if you want to use specific commits, you should also ensure that those
commits modify the version id for the package (usually in the `package/_version.py` file).
For `GRIMOIRELAB`, specify a new tag, that we will produce later,
 and will be the same string than the `grimoirelab` package version,
 `0.1.1` in this example (see below).

Update the version of the `grimoirelab` package, so that it doesn't
conflict with other past packages. This is done by editing
`grimoirelab/_version.py`. In our example, the version file will be
(version of the `grimoirelab` package is therefore `0.1.1`):

```python
__version__ = "0.1.1"
```

Produce the `requirements.txt` file for those commits.
You can do that automatically, using `build_grimoirelab`.
For that, you will need a file for overriding the data about the repositories
embedded in `build_grimoirelab`. This is an example of that file, `repos_local.json`
(substitute `dir` for the directory in which you run 'git clone', in the `"repo_url"` field):

```json
{
    "grimoirelab": [{"name": "grimoirelab",  "dir": "",
            "repo_url": "dir/grimoirelab",
            "version_file": "grimoirelab/_version.py"}]
}
```

Then, just run `build_grimoirelab`, specifying the release file,
the file for overriding repostory information, and the options for
producing the `requirements.txt` file (`--dependencies` and `--depfile`):

```bash
$ utils/build_grimoirelab --relfile releases/18.07-11 \
  --dependencies --depfile requirements.txt \
  --reposfile repos_local.json
```

This new `requirements.txt` file should be a part of a new commit,
along with the release file.
Since a commit hash needs to be specified for the `grimoirelab`
repository in the release file, but that file is a part of the commit,
we use a label for it instead (see above).
And we link `releases/latest` to the latest release file
(this is not mandatory, but useful).

```bash
$ ln -sf releases/18.07-11 releases/latest
$ git add releases/18.07-11 releases/latest requirements.txt
$ git commit -m "Release 0.1.1, corresponding to release file 18.07-11" .
$ git tag 0.1.1
```

And now, we can produce packages for this new release,
creating packages in `/tmp/dist`.
In the process, all pacakges will be installed in their own virtual environment,
some checks will be performed (such as ensuring that their commit corresponds to a change in package id),
and tests for each package will be run.
We will overriding the default list of repos with `repos_local.json`,
as above, for specifying where our `grimoirelab` clone is:

```bash
$ utils/build_grimoirelab --build --install --check \
  --dist /tmp/dist --reposfile repos_local.json \
  --relfile releases/18.07-11
```

And we're done: our fresh packages will be ready in the
`/tmp/dist` directory.

The same command, but running testing for all packages too,
can be run if the `grimmoirelab/full` container is run in advance
(it is needed because some of the tests use servers, provided by these containers):

```bash
$ docker run -p 127.0.0.1:9200:9200 -p 127.0.0.1:5601:5601 \
  -p 127.0.0.1:3306:3306 -e RUN_MORDRED=NO -t grimoirelab/full
```

```bash
$ utils/build_grimoirelab --build --install --check --test --testinstall \
  --dist /tmp/dist --reposfile repos_local.json \
  --relfile releases/18.07-11 --confdir docker/testconf
```

## Producing your own GrimoireLab docker containers

Again, if you want to produce your own containers, the process is as follows.
All of this is run from the root of this repository,
checked out at the release commit (see above).
We start by building `grimoirelab/factory`:

```bash
$ docker build -f docker/Dockerfile-factory -t grimoirelab/factory .
```

Then, with this container, we can produce pàckages in 'docker/dist'.

```bash
$ docker run -v $(pwd)/docker/dist:/dist \
  -v $(pwd)/docker/logs:/logs \
  -v $(pwd)/releases/18.07-11:/release \
  -v $(pwd):/grimoirelab grimoirelab/factory \
  --build --install --check --relfile /release \
  --reposfile /grimoirelab/docker/repos_local.json
```

Then, let's produce the `grimoirelab/installed` image:

```bash
$ docker build -f docker/Dockerfile-installed -t grimoirelab/installed .
```

After it, you can also produce `grimoirelab/full`, which contains the
same, plus the servers needed to build a complete dashboard
(Elasticsearch, MariaDB, Kibiter):

```bash
$ docker build -f docker/Dockerfile-full -t grimoirelab/full .
```

### Testing packages as we build them

When we produced GrimoireLab packages, we can also run their tests,
if we have the needed services installed (ElasticSearch, MariaDB/MySQL):

```bash
$ docker run -v $(pwd)/docker/dist:/dist \
  -v $(pwd)/docker/logs:/logs \
  -v $(pwd)/releases/18.07-11:/release \
  -v $(pwd):/grimoirelab \
  --net="host" grimoirelab/factory \
  --build --install --check --test \
  --relfile /release \
  --reposfile /grimoirelab/docker/repos_local.json \
  --confdir /grimoirelab/docker/testconf
```

An easy way of having all those services is by using the `grimoirelab/full`
container running, with the appropriate ports exposed
(run it before you run the previous line):

```bash
$ docker run -p 127.0.0.1:9200:9200 \
  -p 127.0.0.1:3306:3306 -e RUN_MORDRED=NO \
  -t grimoirelab/full
```

### Giving the new containers a try

For trying the new container images, you can run them.
You will need a Mordred config file for your GitHub token,
something like (below, we asume this is `mytoken.cfg`):

```
[github]
api-token = XXXXXX
```

For `grimoirelab/installed`
you will need ElasticSearch, Kibiter/Kibana and MariaDB/MySQL
installed in the host.
If they are in the standard ports, the container is ready to
use them. 
If not, you can extend `mytoken.cfg` with the needed data
to reach them (find a template for that file as `docker/mordred-local.cfg`).

```bash
$ docker run --net="host" -v $(pwd)/mytoken.cfg:/override.cfg \
  -t grimoirelab/installed
```

Now, point your web browser at [http://127.0.0.1:5601](http://127.0.0.1:5601),
and you should see the dashboard.

For `grimoirelab/full`, since it already includes the services,
you can type:

```bash
$ docker run -p 127.0.0.1:5601:5601 -v $(pwd)/mytoken.cfg:/override.cfg \
  -t grimoirelab/full
```

And again, point your web browser at [http://127.0.0.1:5601](http://127.0.0.1:5601)


## Producing everything with ansible

You can also use ansible to build everything.
For that, you can just ensure you have ansible installed,
produce the requirements.txt file for the release `grimoirelab`
(see above)
and then run it with the `ansible_release.yml` playbook:

```bash
$ pip install ansible
$ git clone https://github.com/chaoss/grimoirelab
$ cd grimoirelab
$ utils/build_grimoirelab --relfile releases/18.07-11 \
  --dependencies --depfile requirements.txt \
  --reposfile repos_local.json
$ cd docker
$ ANSIBLE_STDOUT_CALLBACK=debug ansible-playbook ansible_release.yml \
  --extra-vars "RELEASE=18.07-11 LOCAL=YES" --tags "build"
```

The `repos_local.json` file is as follows
(setup your own directory for `"repo_url"`):

```json
{
    "grimoirelab": [{"name": "grimoirelab",  "dir": "",
            "repo_url": "/dir/grimoirelab",
            "version_file": "grimoirelab/_version.py"}]
}
```