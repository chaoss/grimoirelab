# Roadmap

GrimoireLab was born with the purpose of offering a free, libre, and
open source data platform for analytics and insights about software
development processes.

In GrimoireLab, we develop tools that help developers and managers to make
better decisions for their daily work. Our tools are also designed for the
research and academic community.

We believe in open source and in empirical analysis. We think there's
a lack of these tools in the data analysis ecosystem. Our goals are:

- To be the reference platform for retrieving and analyzing data about
  software development.
- To build an extensible platform, so other tools can built their
  solutions on top of it.
- To improve knowledge and innovation in the field of software
  engineering.

This document enumerates the steps we will take to achieve these goals
and how the platform should evolve in that regard. For more information
about how we manage the ROADMAP, please check the **Roadmap** section in
the [GOVERNANCE](./GOVERNANCE.md#roadmap) file.

## Context

Over the years, we have built a platform that analyzes data from more than
30 data sources, producing more than 150 metrics about activity, performance,
and community in software development. In April 2025, after 8 years of
development, we launched its first major release: **GrimoireLab 1.0**.

Our platform has been used by numerous companies and by some of the most
important open source projects that needed to better understand their
software development processes.

The platform has also been used as the base for building other applications
on top of it, such as [Bitergia Analytics](https://github.com/bitergia-analytics),
[OSS Compass](https://compass.gitee.com/), [Cauldron](https://gitlab.com/cauldronio/),
or [Mystic](https://opensource.ieee.org/rit/mystic-group),

Despite this relative success, we understand that our software has several issues
that prevent our users and developers from getting the most out of it. We have
identified the following challenges:

- **Installation and configuration**: The software is complicated to install
  and require a significant amount of time and knowledge to set it running.
  Some parts of the documentation are also outdated and/or inaccurate.
- **Maintenance**: The maintenance of the platform requires several manual
  steps. Monitoring is also difficult because the platform doesn't provide clear
  information about what tasks are running and what errors have been
  found.
- **Scalability and performance**: The current version of the platform needs
  of several instances for analyzing more than 5000 data sources.
  For example, for a project with around 3500 high-activity repositories
  that retrieves data from GitHub (commits, issues and pull requests),
  the platform needs 3 days to start analyzing new data.
- **Integration**: The current architecture doesn't make life easy
  for developers who want to integrate GrimoireLab with their tools.
  For example, the lack of a well defined data model prevents data analysis
  tools from generating reusable new metrics. There's no API to add or
  remove data sources to analyze or to get the metrics from a particular
  case.
- **Relation with other CHAOSS tools**: There's some overlap in the CHAOSS
  software tools that makes us feel that we're reinventing the wheel. Also,
  people that reach our project through **CHAOSS** often don't understand
  the difference between each tool. We think we can be the reference for data
  retrieval and initial analysis, so other tools can be build on top of
  GrimoireLab.

Some of these problems were also mentioned by our users on the
[2023 CHAOSS Challenges Survey](https://github.com/chaoss/wg-data-science/blob/main/challenges_survey/Challenges_Survey_Results_2023.pdf).

## Objectives

Based on these challenges, we have defined a set of goals:

- **Reduce set up time**: The installation and configuration of the
  platform shouldn't take more than 15 minutes for someone with intermediate
  computing skills and knowledge about software data analysis.
- **Cut manual maintenance to zero**: For usual common cases, such as:
  updating or rebooting the platform, managing retrieval or analysis tasks,
  and regenerating data, the manual interaction with GrimoireLab should
  tend to zero.
- **Increase the throughput**: The platform should be able to analyze
  3500 high-activity GitHub repositories in less than one day.
- **Improve how data is consumed**: Our platform will generate a data model
  that will be well-documented and accessible through APIs.

## Themes

Tasks will be classified under the following themes. Themes are defined to
accomplish the objectives and solve the problems described above.

- **Configuration**: To make easier how to set up and run the platform.
- **Data processing**: To scale the platform for analyzing thousands of
  repositories. We have defined these sub-themes:
  - **Events**: To make an event-driven platform that will improve how
    data is processed.
  - **Scheduling**: To define how tasks can run without timeouts and
    penalties.
- **Data access**: To solve the integration problems and how
  data is consumed. The sub-themes are:
  - **Data model**: For a better representation and description of
    the data we store and produce.
  - **API**: To define different levels of access to data and to support
    the integration with other systems.

Check the [Roadmap section](./GOVERNANCE.md#roadmap)
in our [GOVERNANCE](./GOVERNANCE.md) document for more info about *themes*.

## Implementation

After long evaluation, we have reached the conclusion that the current version of the platform,
GrimoireLab 1.0, requires major changes to accomplish all the goals defined
above. These will be disruptive changes that require deep modifications on the architecture.

For this reason, we have decided to set the current version of the platform
in maintenance mode to put all our effort into developing what will be
GrimoireLab 2.0. Initially, GrimoireLab 1.x will only receive bug fixes from
the maintainers. However, we will accept contributions from the community.

The active development will happen mainly on
[grimoirelab-core](https://github.com/chaoss/grimoirelab-core) repository.
You can follow the progress of the development on the
[GrimoireLab Roadmap board](https://github.com/orgs/chaoss/projects/20).
