# GrimoireLab

[![grimoirelab-showcase](https://user-images.githubusercontent.com/25265451/84442403-30dcce80-ac5b-11ea-9f5b-60266d875ebd.png "GrimoireLab | CHAOSS Bitergia Analytics")](https://chaoss.biterg.io/app/kibana#/dashboard/Overview)

GrimoireLab is a [CHAOSS](https://chaoss.community) toolset for software development analytics. It includes a coordinated set of tools
to retrieve data from systems used to support software development (repositories), store it in databases,
enrich it by computing relevant metrics and making it easy to run analytics and visualizations on it.

You can learn more about GrimoireLab in the [GrimoireLab tutorial](https://chaoss.github.io/grimoirelab-tutorial/),
or visit the [GrimoireLab website](https://chaoss.github.io/grimoirelab).

Metrics available in GrimoireLab are, in part, developed in the CHAOSS project. For more information regarding CHAOSS metrics, see the latest release at: https://chaoss.community/metrics/

# Getting started

GrimoireLab is a set of tools, and to ease starting playing we are providing a [default setup](default-grimoirelab-settings)
to analyze git activity for this repository. Given such set up, there are several options to run GrimoireLab:

## Using `docker-compose`

Requirements:
* **Software**: [git](https://git-scm.com/), [docker client](https://docs.docker.com/install/) and [docker compose](https://docs.docker.com/compose/install/). An example of working configuration:
```console
root@test-68b8628f:~# git --version
git version 2.17.1
root@test-68b8628f:~# docker --version
Docker version 19.03.1, build 74b1e89
root@test-68b8628f:~# docker-compose --version
docker-compose version 1.22.0, build f46880fe
```
* **Hardware**: 2 CPUs, 8GB memory RAM and [enough virtual memory for Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/vm-max-map-count.html) 

Steps:
1. Clone this project:
```console
foo@bar:~$ git clone https://github.com/chaoss/grimoirelab
```
2. Go to `docker-compose` folder and run the following command:
```console
foo@bar:~$ cd grimoirelab/docker-compose
foo@bar:~/grimoirelab/docker-compose$ docker-compose up -d
```

Your dashboard will be ready after a while at `http://localhost:5601`. The waiting time depends on the amount of data to fetch from a repo, for small repositories you can expect your data to be visible in the dashboard after 10-15 minutes.

More details in the [docker-compose folder](./docker-compose/README.md).

## Using `docker run`

Requirements: 
* **Software**: [git](https://git-scm.com/) and [docker client](https://docs.docker.com/install/). An example of working configuration:
```console
root@test-68b8628f:~# git --version
git version 2.17.1
root@test-68b8628f:~# docker --version
Docker version 19.03.1, build 74b1e89
```
* **Hardware**: 2 CPUs, 8GB memory RAM and set

Steps:
1. Clone this project:
```console
$ git clone https://github.com/chaoss/grimoirelab
```
2. Go to the project folder and run the following command:
```console
foo@bar:~$ cd grimoirelab
foo@bar:~/grimoirelab $ docker run -p 127.0.0.1:5601:5601 \
-v $(pwd)/default-grimoirelab-settings/projects.json:/projects.json \
-v $(pwd)/default-grimoirelab-settings/setup.cfg:/setup.cfg \
-t grimoirelab/full
```

Your dashboard will be ready after a while at `http://localhost:5601`. The waiting time depends on the amount of data to fetch from a repo, for small repositories you can expect your data to be visible in the dashboard after 10-15 minutes.

More details in the [docker folder](./docker/README.md).

# GrimoireLab components

Currently, GrimoireLab toolkit is organized in the following repositories:

* Data retrieval related components:
  * [Perceval](https://github.com/chaoss/grimoirelab-perceval): retrieval of data from data sources
    * [Perceval (bundle for OPNFV)](https://github.com/chaoss/grimoirelab-perceval-opnfv)
    * [Perceval (bundle for Mozilla)](https://github.com/chaoss/grimoirelab-perceval-mozilla)
    * [Perceval (bundle for Puppet)](https://github.com/chaoss/grimoirelab-perceval-puppet)
    * [Perceval (bundle for Weblate)](https://github.com/chaoss/grimoirelab-perceval-weblate)
  * [Graal](https://github.com/chaoss/grimoirelab-graal): source data analysis with external tools
  * [KingArthur](https://github.com/chaoss/grimoirelab-kingarthur): batch processing for massive retrieval
* Data enrichment related components:
  * [GrimoireElk](https://github.com/chaoss/grimoirelab-elk): storage and enrichment of data
  * [Cereslib](https://github.com/chaoss/grimoirelab-cereslib): generic data processor
  * [SortingHat](https://github.com/chaoss/grimoirelab-sortinghat): identity management
* Data consumption related components:
  * [Kibiter](https://github.com/chaoss/grimoirelab-kibiter): dashboard, downstream version of Kibana
  * [Sigils](https://github.com/chaoss/grimoirelab-sigils): visualizations and dashboards
  * [Kidash](https://github.com/chaoss/grimoirelab-kidash): visualizations and dashboards manager
  * [Manuscripts](https://github.com/chaoss/grimoirelab-manuscripts): reporting
* Platform management, orchestration, and common utils:
  * [Mordred](https://github.com/chaoss/grimoirelab-mordred): orchestration
  * [GrimoireLab Toolkit](https://github.com/chaoss/grimoirelab-toolkit): common utilities
  * [Bestiary](https://github.com/chaoss/grimoirelab-bestiary): web-based user interface to manage repositories and projects for Mordred
  * [Hatstall](https://github.com/chaoss/grimoirelab-hatstall): web-based user interface to manage SortingHat identities

There are also some [components built by the GrimoreLab community](community_components.md),
which can be useful for you. Other related repositories are:
* [GrimoireLab Tutorial](https://github.com/chaoss/grimoirelab-tutorial)
* [GrimoireLab as a whole](https://github.com/chaoss/grimoirelab) (this repository)

## Contents of this repository

This repository is for stuff relevant to GrimoireLab as a whole. For example:

* Issues for new features or bug reports that affect more than one GrimoireLab module. In this case, let's open an issue here, and when implementing the fix or the feature, let´s comment about the specific tickets in the specific modules that are used. For example, when supporting a new datasource, we will need patches (at least) in `Perceval`, `GrimoireELK` and panels. We would open here the feature request (or the user story) for the whole case, an issue (and later a pull request) in `Perceval` for the data retriever, same for `GrimoireELK` for the enriching code, and same for `panels` for the Kibiter panels.

* Information about "coordinated releases" for most of GrimoireLab components
(directory [releases](releases)).
Coordinated releases are snapshots (specific commits)
of most of the GrimoireLab components that are expected to work together.
See more information in the [releases README.md file](releases/README.md).

* Utils (directory [utils](utils)) for doing stuff relevant to GrimoireLab
as a whole.
Includes a script to produce Python packages for a coordinated release, etc.

* Docker containers for showcasing GrimoireLab (directory [docker](docker)).
Includes dockerfiles and configuration files for the GrimoireLab containers
that can be used to demo the technology, and can be the basis for real
deployments. See more information in the [docker README.md file](docker/README.md).

* If you feel more comfortable with `docker-compose`, the [docker-compose](docker-compose)
folder includes instrucctions and configuration files to deploy GrimoireLab using
`docker-compose` command.

* Source code of the GrimoireLab components is available in `src`. Each directory is a
Git submodule, so its contents will not be available after cloning the repository. To
fetch all the data, you can run the following commands:
```console
$ git submodule init
$ git submodule update
```

* How releases of GrimoireLab are built and tested: [Building](BUILDING.md)

## Citation

If you use GrimoireLab in your research papers, please refer to [GrimoireLab: A toolset for software development analytics](https://doi.org/10.7717/peerj-cs.601):

APA style:

```
Dueñas S, Cosentino V, Gonzalez-Barahona JM, del Castillo San Felix A, Izquierdo-Cortazar D, Cañas-Díaz L, Pérez García-Plaza A. 2021. GrimoireLab: A toolset for software development analytics. PeerJ Computer Science 7:e601 https://doi.org/10.7717/peerj-cs.601
```

BibTeX / BibLaTeX:

```
@Article{duenas2021:grimoirelab,
  author = 	 {Dueñas, Santiago and Cosentino, Valerio and Gonzalez-Barahona, Jesus M. and del Castillo San Felix, Alvaro and Izquierdo-Cortazar,  Daniel and Cañas-Díaz, Luis and Pérez García-Plaza, Alberto},
  title = 	 {GrimoireLab: A toolset for software development analytics},
  journaltitle = {PeerJ Computer Science},
  date = 	 {2021-07-09},
  volume = 	 7,
  number = 	 {e601},
  doi = 	 {10.7717/peerj-cs.601},
  url = 	 {https://doi.org/10.7717/peerj-cs.601}}
```

# Contributing

Contributions are welcome, please check the [Contributing Guidelines](CONTRIBUTING.md).
