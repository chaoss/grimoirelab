# GrimoireLab

This is for stuff relevant to GrimoireLab as a whole. For example:

* Issues for new features or bug reports that affect more than one GrimoireLab module. In this case, let's open an issue here, and when implementing the fix or the feature, let´s comment about the specific tickets in the specific modules that are used. For example, when supporting a new datasource, we will need patches (at least) in `Perceval`, `GrimoireELK` and panels. We would open here the feature request (or the user story) for the whole case, an issue (and later a pull request) in `Perceval` for the data retriever, same for `GrimoireELK` for the enriching code, and same for `panels` for the Kibiter panels.

* Information about "coordinated releases" for most of GrimoireLab components
(directory [releases](releases)).
Coordinated releases are snapshots (specific commits)
of most of the GrimoireLab components that are expected to work together.
See more information in the [releases README.md file](releases/README.md).

* Utils (directory [utils](utils)) for doing stuff relevant to GrimoireLab
as a whole:
a script to produce Python packages for a coordinated release, etc.
