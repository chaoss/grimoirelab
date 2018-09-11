# GrimoireLab

GrimoireLab is a toolset for software development analytics. It includes a coordinated set of tools
to retrieve data from systems used to support software development (repositories), store it in databases,
enrich it by computing relevant metrics, and making it easy to run analytics and visualizations on it.

You can learn more about GrimoireLab in the [GrimoireLab tutorial](https://grimoirelab.gitbooks.io/tutorial),
or visit the [GrimoireLab website](https://grimoirelab.github.io).

Currently, GrimoireLab is organized in the following repositories:

* [Perceval](https://github.com/chaoss/grimoirelab-perceval): retrieval of data from data sources
* [Perceval (bundle for OPNFV)](https://github.com/chaoss/grimoirelab-perceval-opnfv)
* [Perceval (bundle for Mozilla)](https://github.com/chaoss/grimoirelab-perceval-mozilla)
* [Perceval (bundle for Puppet)](https://github.com/chaoss/grimoirelab-perceval-puppet)
* [KingArthur](https://github.com/chaoss/grimoirelab-kingarthur): batch processing for massive retrieval
* [Elk](https://github.com/chaoss/grimoirelab-elk): storage and enrichment of data
* [GrimoireLab Toolkit](https://github.com/chaoss/grimoirelab-toolkit): common utilities
* [SortingHat](https://github.com/chaoss/grimoirelab-sortinghat): identity management
* [Mordred](https://github.com/chaoss/grimoirelab-mordred): orchestration
* [Sigils](https://github.com/chaoss/grimoirelab-sigils): visualizations and dashboards
* [Manuscripts](https://github.com/chaoss/grimoirelab-manuscripts): reporting
* [Bestiary](https://github.com/chaoss/grimoirelab-bestiary): web-based user interface to manage repositories and projects for Mordred
* [Hatstall](https://github.com/chaoss/grimoirelab-hatstall): web-based user interface to manage SortingHat identities
* [Tutorial](https://github.com/chaoss/grimoirelab-tutorial)
* [GrimoireLab as a whole](https://github.com/chaoss/grimoirelab)

GrimoireLab is a [CHAOSS](https://chaoss.community) project.

There are also some [components built by the GrimoreLab community](community_components.md),
which can be useful for you.

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

* How releases of GrimoireLab are built and tested: [Building](BUILDING.md)
