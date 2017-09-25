# Contributing to GrimoireLab

These are some general guidelines and information related to how we contribute to GrimoireLab.

GrimoireLab is a part of the [Software Technical Committee](https://wiki.linuxfoundation.org/chaoss/software) of the [CHAOSS Collaborative Project](http://chaoss.community).

## Communication means

GrimoireLab  use the following communication channels:

* Mailing list
* IRC channel
* Issues / pull requests

Each of them is intended for an specific purpose. Please, understand
that you may be redirected to some other mean if the communication you
intend to have is considered to fit better elsewhere.

### Mailing list

List:
[grimoirelab-discussions@lists.linuxfoundation.org](https://lists.linux
foundation.org/mailman/listinfo/grimoirelab-discussions)

We use the list for:

* Discussions related to the management of the project, including the
relationship with the CHAOS Software Technical Committee
* General announcements, including information about releases
* General discussions about the future of the project, relationship
with other projects, new features or refactorings that really don't fit
in other communication means.
* Questions and community support that really don't fit in other
communication means.

### IRC channel

Channel: `#grimoirelab` at [Freenode](http://freenode.net/)

We use the channel for pinging people, quick and informal
discussions, questions and answers, etc. Please, don't consider that
developers in the channel will be always available, or always willing
to answer questions and comments. However, anyone interested in the
project is welcome to join the channel and hang around.

### Pull request / issues

Repositories: [GrimoireLab repositories in GitHub](http://github.com/gr
imoirelab)

Most of the work is discussed here, including upgrades and
proposals for upgrades, bug fixing, and feature requests. For any of
these, open an issue in corresponding repository. If in doubt, ask in
the IRC channel, or try in any one: if needed you will be redirected to
the right repository. If you are proposing code, open a pull request.

## Committers

Committers will have permision to merge code in GrimoireLab. Committers
can be for all GrimoireLab, or for specific repositories.

New committers will be proposed by committers, and accepted (granted
committer rights) by an action vote among committers (see below).
Developers can apporach committers to ask to be proposed as comitter.
Main rule for acceptance of new committers will be their merits on the
project, including past contributions and expertise.

Comitters may resign, if they are no longer involved enough in the
project. Comitters can also propose the removal of other committer
rights, in case they are no longer involved in the project. For being
removed, after the proposal there will be an action voting among
committers, except for the one being proposed to be removed.

The current list of committers is (GitHub handles):

* General: sduenas, acs, dicortazar, sanacl, jgbarah
* panels: alpgarcia
* reports: alpgarcia
* web: jsmanrique

## Voting on action items (action votes)

Action items will be decided by public votes in the mailing list for
the project. Anyone in the mailing list can vote, to express their
opinion, but the result of the vote will have into account only the
votes by general committers.

Votes will be casted as (details taken in part from the Apache
project):

+ 1: Yes, agree, or the action should be performed.
0: Abstain, no opinion, or I am happy to let the other group members
decide this issue.
-1: No, I veto this action. All vetos must include an explanation of
why the veto is appropriate. A veto with no explanation is void.

A period of four days, since the moment the action item is proposed,
will be valid for casting votes. Any comitter can propose an action
vote, which will be effective if at least two other committers agree
during a period of two days. The voting period will start when the
proposer sends a message stating that, after the second agreement is
received.

Action votes will be mandatory for:

* Accepting a new committer.
* Proposal for removal of committer rights.
* Accepting a new repository in the project.
* Removing a repository from the project.
* Deciding that some certain code in some repository needs to be moved
to some other repository.

In all the cases, the action vote will pass with at least 3 positive
votes and no vetos.

## Accepting contributions

Except for a few exceptions, all contributions to current repositories
in GrimoireLab will be received as pull requests in the corresponding
repository. They will be reviewed by at least one committer before
being accepted. Anyone is welcome to comment on pull requests.

Except in very special circumstances, that should be defined,
contributions will be accepted under the GPLv3 (GNU Public License
version 3).

The list of current repositories is the list of projects in the
GrimoireLab organization in GitHub.

## Incubating repositories

In some cases, activity related to GrimoireLab may start in
repositories outside the GrimoireLab project. In that case, if the
developers collaborating in those repositories want, they can inform
GrimoireLab of their progress, and propose coordianted actions (such as
definition of APIs). However, they will be considered extenal projects
until the moment they are accepted as repositories in GrimoireLab, via
an action vote.

## Merging contributions

TBD

## Releases

GrimoireLab will deliver frequent coordinated releases of several of
the code in its repositories. Those releases should have passed somem
testing procedures known to the project. Releases will be announced in
the mailing list.
