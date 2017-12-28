# GrimoireLab test environment

The goal of this directory is to include the files needed to
use mordred to test all data sources supported in GrimoireLab.
The files involved are:

* Configuration for GrimoireLab:
    * setup.cfg: Main config file for mordred with all data sources and credentials
    * projects.json: Repositories used in data sources
    * requirements.cfg: sample file with the versions of GrimoireLab stack to be used
    * orgs_file: organizations file to be loaded in Sorting Hat for affiliations

* Configuration for the GrimoireLab docker image:
    * stage: script started after the docker image is run, it includes all the testing stuff.
    * Dockerfile: configuration file with all the steps for docker to create
the GrimoireLab container image

* Configuration for running all containers, including the above docker image:
    * docker-compose.yml: minimum docker compose file to launch mordred
    * docker-compose-local.yml: example of additional local docker compose config file

* Data for tests:
    * cache-test.tgz: Perceval cache for all data sources, mbox and irc data,
and raw data for Perceval-supported data sources without cache support
and data sources not supported by Perceval.

In short, the process, starting from scratch, is:

* Produce the docker image with GrimoireLab. This image prepares a basic
Debian system, calling at the end the `stage` script. This one will
call `utils/build_grimoire`, which created Python packages using
`master/HEAD` for all GrimoireLab repos, the installs them,
and then runs some tests.

* Execute the above image, with some other container images: one for
Elasticsearch, another one for Kibiter, and another one for MariaDB.

## Creating grimoirelab Docker image

`grimoirelab` is a basic Docker image, prepared for installing GrimoireLab
tools in it. It's definition is in `Dockerfile`.
For creating the image:

```
$ docker build -t grimoirelab/basic .
```

## Running the containers

You just need to execute:

```bash
$ mkdir logs
$ docker-compose rm mordred
$ docker-compose up --force-recreate mordred
```

This will launch all containers. For the ElasticSearch container to work,
you need (depending on the configuration of the host) to increase the limits
on nmap, for 64 bit systms. In Linux-based systems, run this command
in the host machine:

```
$ sudo sysctl -w vm.max_map_count=262144
```

To set this value permanently,
update the `vm.max_map_count` setting in `/etc/sysctl.conf`.
To verify after rebooting, run sysctl `vm.max_map_count`.
The RPM and Debian packages will configure this setting automatically.
No further configuration is required.

In the logs/all.log file you can track the execution of `mordred`.

The above command run the set of containers specified in the default
configuration file `docker-compose.yml`.
The one provided in this directory intends to be minimal,
so that containers can be deployed with as a few constraints as possible.
For example, it does not expose ElasticSearch or Kibana ports to the host.
In case you want to do this, for example for accessing them from the host,
run a local configuration override file. For example:

```bash
$ docker-compose -f docker-compose.yml -f docker-compose-local.yml up mordred
```

`docker-compose`, run as above, will redirect the output from all
the containers to the stdout.
If you want to avoid all those messages, you can just redirect them to file:

```bash
$ docker-compose up mordred > /tmp/log
```

If you want to enter the container to debug inside it, once the docker container
is up and running execute:

```bash
docker exec -t -i tests_mordred_1 env TERM=xterm /bin/bash
```

## Creating a testing dashboard

To create a simple dashboard, assuming you already have installed ElasticSearch
and Kibana in the host, listening in the default ports, just install
`grimoire-mordred` in a Python virtual environment, initialize with some raw indexes,
and run mordred:

```
$ pip install grimoire-mordred
$ export ES=http://localhost:9200
$ ./init-raw.sh
$ git clone https://github.com/grimoirelab/panels
$ mordred -c setup.cfg
```

## Panel testing

This testing is in beta status yet.

In order to test the paneles generated during the testing of mordred you need to add some additional dependencies. Right now it is done using symlinks. It will be improved soon.

You need to check out mordred, GrimoireELK and panels repositories from GrimoireLab in ~/devel directory and then:

```
ln -s ~/devel/mordred/mordred .
ln -s ~/devel/GrimoireELK/grimoire_elk .
ln -s ~/devel/panels .
./check_panels.py 2>/dev/null| grep -B2 "RESULT:  KO" | grep Checking | awk '{print $2}' | sort
```

To check for a specific panel:

```
python3 ~/devel/panels/src/owlwatch/owlwatch.py  compare-panel -e http://bitergia:bitergia@localhost:9200 -p ~/devel/panels/json/slack.json
```
