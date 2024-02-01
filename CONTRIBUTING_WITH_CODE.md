# Contributing with Code

Before submitting your code, please make sure that:

- Your code follows the coding standards.
- You've added relevant tests and documentation.
- All tests pass successfully.
- Your commits are [rebased](https://docs.github.com/en/get-started/using-git/about-git-rebase).
- Your commits are well-documented ([see below](#how-to-write-good-commit-messages)).
- The commits are signed with a Developer Certificate Origin
  ([see below](#developer-certificate-origin)).
- You include a changelog entry ([see below](#changelog-entries)).

Your contribution will be reviewed by at least one maintainer before
being accepted. Anyone is welcome to comment on pull requests.

## How to Write Good Commit Messages

Writing a well-crafted Git commit message is the best way to communicate
context about a change.

The following are some tips to help you writing a great commit message:

1. Separate the subject from the body with a blank line.
1. Limit the subject line to 50 characters.
1. Capitalize the subject line and (optionally) start the subject with a tag.
1. Do not end the subject line with a period.
1. Use the imperative mood in the subject line.
1. Wrap the body at 72 characters.
1. Use the body to explain what and why rather than how.

The following is a good example of an effective commit message.

```text
Summarize changes in around 50 characters or less

More detailed explanatory text, if necessary. Keep it to about 72
characters. In some contexts, the first line is treated as the
subject of the commit and the rest of the text as the body. The
blank line separating the summary from the body is critical (unless
you omit the body entirely); various tools like `log`, `shortlog`
and `rebase` can get confused if you run the two together.

Explain the problem that this commit is solving. Focus on why you
are making this change as opposed to how (the code explains that).
Are there side effects or other unintuitive consequences of this
change? Here's the place to explain them.

Further paragraphs come after blank lines.

 - Bullet points are okay, too

 - Typically a hyphen or asterisk is used for the bullet, preceded
   by a single space, with blank lines in between, but conventions
   vary here

If you use an issue tracker, put references to them at the bottom,
like this:

Resolves: #123
See also: #456, #789
```

You can find the full description of these rules with examples on the post
[How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
by Chris Beams (kudos to Chris!)

## Developer Certificate Origin

GrimoireLab is a free, libre, and open source software released under the
GNU Public License version 3 (GPL3). The purpose of the
[Developer Certificate of Origin (DCO)](http://developercertificate.org) is
to confirm that you have the legal right to contribute your work and you are
willing to have it included in the project under the terms of the GPL3.

The [CHAOSS Charter](https://github.com/chaoss/governance/blob/master/project-charter.md)
requires that contributions are accompanied by a [DCO](http://developercertificate.org)
sign-off.

By signing your commits, you acknowledge that you have read and agree to the DCO.

You must sign your commits by adding a line like this to your commit message:

```text
Signed-off-by: Your Name <YourName@example.org>
```

This can be automatically added to your commits using the `-s` or `--signoff`
option with `git commit`.

## Changelog Entries

Some of your contributions will require a changelog entry which explains the
motivation for the change. These entries are included in the **Release Notes**
to explain to users and developers the new features or bugs fixed in the
software. This is an example of changelog entry:

```yaml
title: 'Fix bug casting spells on magicians'
category: fixed
author: John Smith <jsmith@example.com>
issue: 666
notes: >
    The bug was making it impossible to cast a spell on
    a magician.
```

Changelog entries will be written to explain *what* was changed and *why*,
not *how*. Take into account that not everyone is a developer and the entries
are meant to reach a wider audience.

The Python package [release-tools](https://github.com/Bitergia/release-tools/)
will help you in this process. Just install the package and run the command
`changelog` on the repository where you made the change.

```terminal
pip install release-tools
changelog
```

### What Warrants a Changelog Entry

Changelog entries are **required** for:

- Code changes that directly affects the GrimoireLab users.
- Bug fixes.
- New updates.
- Performance improvements.

Changelog entries are **not required** for

- Docs-only (e.g., README.md) changes.
- Developer-facing change (e.g., test suite changes).
- Code refactoring.

### Writing Changelog Entries

These changelog entries should be written to the `releases/unreleased/`
directory. The file is expected to be a [YAML](https://yaml.org/) file
in the following format:

```yaml
title: 'Fix bug casting spells on magicians'
category: fixed
author: John Smith <jsmith@example.com>
issue: 666
notes: >
    The bug was making impossible to cast a spell on
    a magician.
```

The `title` field has the name of the change. This is a mandatory field.

The `category` field maps the category of the change. Valid options are:
`added`, `fixed`, `changed`, `deprecated`, `removed`, `security`,
`performance`, `dependency`, and `other`. This field is mandatory.

The `author` key (format: `Your Name <YourName@example.org>`) is used to
give credit to community contributors. This is an optional field but
the community contributors are encouraged to add their names.

The `issue` value is a reference to the issue, if any, that is targeted
with this change. This is an optional field.

The `notes` field should have a description explaining the changes in the
code. Remember you can write blocks of text using the `>` character at the
beginning of each block. See the above example.

Contributors can use the interactive [changelog](https://github.com/Bitergia/release-tools#changelog)
tool, which generates the changelog entry file automatically.

### Tips for Writing Effective Changelog Entries

An effective changelog entry should be descriptive and concise. It should explain
the change to a reader who has *zero context* about the change. If you have
trouble making it both concise and descriptive, err on the side of descriptive.

Use your best judgment and try to put yourself in the mindset of someone
reading the compiled changelog. Does this entry add value? Does it offer
context about *what* was changed and *why*?

### Examples

- **Bad:** Go to a project order.
- **Good:** Show a user’s starred projects at the top of the “Go to project” dropdown.

The first example provides no context of where or why the change was made, or
how it benefits the user.

- **Bad:** Copy (some text) to clipboard.
- **Good:** Update the “Copy to clipboard” tooltip to indicate what’s being copied.

Again, the first example is too vague and provides no context.

- **Bad:** Fixes and Improves CSS and HTML problems in mini pipeline graph and builds dropdown.
- **Good:** Fix tooltips and hover states in mini pipeline graph and builds dropdown.

The first example is too focused on implementation details. The user doesn’t care
that we changed CSS and HTML, they care about the result of those changes.

- **Bad:** Strip out `nil`s in the Array of Commit objects returned from `find_commits_by_message_with_elastic`
- **Good:** Fix 500 errors caused by Elasticsearch results referencing garbage-collected commits

The first example focuses on *how* we fixed something, not on *what* it fixes.
The rewritten version clearly describes the *end benefit* to the user
(fewer 500 errors), and *when* (searching commits with Elasticsearch).
