# Community components

These are several components built by the CHAOSS/GrimoireLab community,
interacting with GrimoireLab at some level,
which are not currently a part of the "official" GrimoireLab components.
Please, have a look at them, use them, and provide as much feedback on them as possible!

If you want your component to be listed here, just produce a pull request to this file.

## Collections of panels

Collections of panels alternative or complementary to those in
[grimoirelab-sigils](http://github.com/chaoss/grimoirelab-sigils)

* [Ben Lloyd Pearson panels](https://github.com/BenLloydPearson/grimoirelab-dashboards)
by [Ben Lloyd Pearson](https://github.com/BenLloydPearson).

## Software components

Software components interoperating with GrimoireLab, either complementary
or alternative:

* [Graal](https://github.com/valeriocos/graal) by [Valerio Cosentino](https://valeriocos.github.io/):
Generic Repository AnALyzer Build Status Coverage Status.
Graal leverages on the Git backend of Perceval and enhances it to set up ad-hoc source code analysis. 
It fetches commits from a Git repository and provides a mechanism to plug third party tools/libraries 
focused on source code analysis.

## Integrations

Integrations of GrimoireLab components, usually with some other software:

* [Augur](https://github.com/OSSHealth/augur).
Functionally, Augur is a prototyped implementation of the 
Linux Foundation's CHAOSS Project on open source software metrics.
Augur is a sister project in CHAOSS, using Perceval (a GrimoireLab component) 
for retrieving data from some of its data sources.

* [Q-DashMan](https://github.com/zhquan/TFM/)
by [Quan Zhou](https://github.com/zhquan).
Master thesis which consists of a completely automated system that provides
a web interface for configuring GrimoireLab, so that it analyizes any set of
repositories.

* [Prosoul](https://github.com/Bitergia/prosoul)
The goal of this project is to create a web editor and viewer for software quality models that are used to show metrics in a meaningful way, and importers and exporters for the different quality models used in the industry.
This software is produced in the context of the [CROSSMINER project](https://github.com/crossminer),
and interoperates with GrimoireLab by consuming its standard indexes.
It also uses some visualizations based in GrimoireLab components. 

* [Prospector](https://github.com/chaoss/prospector).
Prospector permits automated collection of a wide range of metrics of open source projects 
useful in evaluating the project.
Prospector is a sister project in CHAOSS, using Perceval (a GrimoireLab component) 
for retrieving data from its data sources.

## Scripts and miscellanenous utilities

* [json2hat](https://github.com/lukaszgryglicki/bitergia_deployment/blob/master/cmd/json2hat/json2hat.go) by [Łukasz Gryglicki](https://github.com/lukaszgryglicki). Go script that imports the file github_users.json from the [cncf/gitdm](https://github.com/cncf/gitdm) GitHub repo into a SortingHat database.

## Deployments

* [Running GrimoireLab with AWS Fargate](https://github.com/andrew-mclachlan/grimoirelab-aws-cdk) by [Andrew McLachlan](https://github.com/andrew-mclachlan). Setup for deploying GrimoireLab using [AWS Fargate](https://aws.amazon.com/fargate) with a Network Load Balancer.

## Research & Development Projects

* [CROSSMINER](https://github.com/crossminer) .
The CROSSMINER Project, funded under the European Union's Horizon 2020 Research and Innovation Programme,
aims to enable the monitoring, in-depth analysis and evidence-based selection of open source components, and facilitates knowledge extraction from large open-source software repositories.
Some of the components produced by it, notoriously [Prosoul](https://github.com/Bitergia/prosoul)
interoperate with GrimoireLab.

## Other Data Sources

* [grimoirelab-gitee](https://github.com/grimoirelab-gitee) 
by [WillemJiang](https://github.com/WillemJiang), [heming6666](https://github.com/heming6666),
[Yehui Wang](https://github.com/eyehwan), [shanchenqi](https://github.com/shanchenqi). grimoirelab-gitee is to provide solution for Gitee as one perceval backend, also including raw-enrich data handling. For more information, you can refer to the [wiki page](https://github.com/grimoirelab-gitee/grimoirelab/wiki/How-to-run-grimoirelab-gitee%3F).