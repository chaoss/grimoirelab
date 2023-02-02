# Docker image for GrimoireLab

## Intro

This docker image runs a container preinstalled with a certain release of
GrimoireLab, including all libraries and programs. By default, it runs 
the GrimoireLab orchestrator - `sirmordred` - for producing a dashboard given 
a mordred configuration file.

If you prefer, you can run GrimoireLab using docker-compose it's the simplest 
method to get started with. More details in the [docker-compose 
folder](../docker-compose/).

## Requirements

* [Git](https://git-scm.com/)
* [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
* Recommended, 2CPUs, 8GB memory RAM, and 2GB SWAP (MacOS users can manage it 
with [Docker client for Mac](https://hub.docker.com/editions/community/docker-ce-desktop-mac))

## Build the image

To produce the image, run the following command:
```
$ docker build -f Dockerfile -t grimoirelab/grimoirelab .
```

You can build a specific version of grimoirelab updating `GRIMOIRELAB_RELEASE`
environment variable inside the Dockerfile.

## Run the image

The image will run the GrimoireLab orchestrator -  `sirmordred`- by default. You
need to define a `setup.cfg` and a `projects.json`. This repository comes with some 
configuration files in [default-grimoirelab-settings](../default-grimoirelab-settings)
directory. These files are the minimum set up to analyze git activity in this 
repository. If you want to analyze a different project with a different set of 
repositories and data sources, you need to modify [`projects.json`](../default-grimoirelab-settings/projects.json) 
and [`setup.cfg`](../default-grimoirelab-settings/setup.cfg) files. See 
[below](#more-information) more information about these files format.

You also need a SortingHat server running at http://localhost:8000/identities.
See [Sortinghat for more information](https://github.com/chaoss/grimoirelab-sortinghat)

Default configuration files assumes Elasticsearch is available in port 9200, 
and MariaDB or MySQL in their standard port (if they are not present, the 
process will fail).

Run the following command from the root of this repository to start using 
SirMordred:
```
docker run --net=host \ 
    -v $(pwd)/default-grimoirelab-settings/projects.json:/home/grimoire/conf/projects.json \
    -v $(pwd)/default-grimoirelab-settings/setup-docker.cfg:/home/grimoire/conf/setup.cfg \
    -t grimoirelab/grimoirelab
```

Remember you can run GrimoireLab and this image using docker-compose. It's the 
simplest method to get started with. More details in the [docker-compose 
folder](../docker-compose/).

You can also run any GrimoireLab tool using this image, for example, you can collect 
Git commits using Perceval:
```
$ docker run grimoirelab/grimoirelab perceval git https://github.com/chaoss/grimoirelab-perceval.git
```

## Configuration

The different files we can modify are:
- setup.cfg: SirMordred's configuration file (GrimoireLab orchestrator configuration)
- projects.json: JSON file with projects and their repositories

### setup.cfg

The configuration file is composed of several sections which allow to
define the general settings such as which phases to activate (e.g., collection,
enrichment) and where to store the logs, as well as the location and 
credentials for SortingHat and the ElasticSearch instances where the raw and 
enriched data is stored. Furthermore, it also includes backend sections to set
up the parameters used by Perceval to access the software development tools 
(e.g., GitHub tokens, Gerrit username) and fetch their data.

The complete list of options and their description 
[is available here](https://github.com/chaoss/grimoirelab-sirmordred#setupcfg-).

We provide a complete example that works out of the box with CHAOSS data and 
some visualizations based on the collected data. By default, only Git collection
is enabled. Take a look and configure many other options.

### projects.json

The projects.json aims at describing the repositories grouped by a project that
will be shown on the dashboards.

The project file enables the users to list the instances of the software 
development tools to analyze, such as local and remote Git repositories, 
the URLs of GitHub and GitLab issue trackers, and the name of Slack channels.
Furthermore, it also allows the users to organize these instances into nested 
groups, which structure is reflected in the visualization artifacts 
(i.e., documents and dashboards).

There are some filters, labels and a special section, [take a look here for more
details.](https://github.com/chaoss/grimoirelab-sirmordred#projectsjson-).

