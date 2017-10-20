# Mordred test environment

The goal of this directory is to include the files needed to 
use mordred to test all data sources supported in GrimoireLab.

* setup.cfg: Main config file for mordred with all data sources and credentials
* projects.json: Repositories used in data sources
* requirements.cfg: sample file with the versions of GrimoireLab stack to be used
* orgs_file: organizations file to be loaded in Sorting Hat for affiliations
* cache-test.tgz: perceval cache for all data sources, mbox data and irc data.
* docker-compose.yml: sample docker compose file to launch mordred
* ssh: directory including public/private ssh keys for accessing gerrit server
* stage: Sample boot script for the mordred docker image useful for debugging

So you just need to execute:

```
mkdir logs
docker-compose up mordred
```

In the logs/all.log file you can track the execution of mordred.

If you want to enter the container to debug inside it, once the docker container
is up and running execute:

```
docker exec -t -i testing_mordred_1 env TERM=xterm /bin/bash
```
