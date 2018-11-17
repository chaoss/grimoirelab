## Coordinated releases

This directory contains a list of past "coordinated releases"
(including the current one) of GrimoireLab components.
A coordinated release of GrimoireLab is a set of snapshots (commits)
of most of its components, which are expected to work together.
To ensure that they work together, those snapshots go through
some integration testing.
The fact that all elements in a given coordinated release
don't play well together should be considered as a bug.

Coordinated releases are produced usually weekly.
The names of the coordinated releases are based on http://www.superherodb.com/characters/

Each file in this directory corresponds to one release.
The name of the file (for example, `elasticgirl.16`)
is the identifier of the release.
It should be composed of the release name, a dot, and the release number.

The current format of release files is as follows:

* First line: `#!/bin/bash`
* For each of the components in the release,
  a line defining a bash variable.
  The name of the variable is the identifier of the component
  (for example, `PERCEVAL`),
  assigned to a value which is the string of the
  commit hash corresponding to the snapshot of the component.

An example of this format is as follows:

```
#!/bin/bash
SORTINGHAT='cc07e9bad23df2fbda785418773ab5eb0cc2fa8e'
GRIMOIREELK='0.17-1-g9c08bb2'
MORDRED='1.1.1-10-g1334b1c'
VIZGRIMOIREUTILS='f5db1da9982484ec7d437d69358e69f609128717'
PERCEVAL='0.4.0-46-g555adb1'
PERCEVAL_MOZILLA='d2298b851d7ac69f253b45018167c7356e24f935'
PANELS='fa236773c8c7b4d39c5c4dc34df7ba761569f076'
```

Happy hacking!
