# Mordred test environment

The goal of this directory is to include the files needed to
use mordred to test all data sources supported in GrimoireLab.

* setup.cfg: Main config file for mordred with all data sources and credentials
* projects.json: Repositories used in data sources
* requirements.cfg: sample file with the versions of GrimoireLab stack to be used
* orgs_file: organizations file to be loaded in Sorting Hat for affiliations
* cache-test.tgz: perceval cache for all data sources, mbox data and irc data.
* docker-compose.yml: minimum docker compose file to launch mordred
* docker-compose-local.yml: example of additional local docker compose config file
* stage: Script for testing for the mordred docker image

So you just need to execute:

```bash
$ mkdir logs
$ docker-compose up mordred
```

In the logs/all.log file you can track the execution of mordred.

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
docker exec -t -i testing_mordred_1 env TERM=xterm /bin/bash
```

# Panel testing

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
