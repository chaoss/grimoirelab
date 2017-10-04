This directory contains a list of different of the Bitergia Analytics stack. The names we are using are based on http://www.superherodb.com/characters/

In order to use of these releases, create the requirements.cfg file with a content like this:
```
#!/bin/bash

RELEASE='batgirl'

```

For debugging purposes, you'll need to add the specific commit for every component as in the example below. But make sure you know what you are doing ;). Remember, for specific versions don't set the RELEASE variable.

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
