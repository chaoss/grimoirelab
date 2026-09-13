#!/usr/bin/env python3
"""Render a runtime SirMordred config from a template, injecting the GitHub token.

Replaces __GITHUB_TOKEN__ in the template with GITHUB_TOKEN / GH_TOKEN from the
environment. The output is git-ignored and holds the real secret; never commit it.

  GITHUB_TOKEN=$(gh auth token) python scripts/render_setup.py \
      default-grimoirelab-settings/setup-ni.cfg.template \
      default-grimoirelab-settings/setup-ni.cfg

The token is never printed. Refuses to write if the token is missing or a
placeholder remains after substitution.
"""
import os
import sys

PLACEHOLDER = "__GITHUB_TOKEN__"


def main():
    if len(sys.argv) != 3:
        sys.exit("usage: render_setup.py <template> <output>")
    template, output = sys.argv[1], sys.argv[2]

    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if not token:
        sys.exit("error: set GITHUB_TOKEN or GH_TOKEN (try: GITHUB_TOKEN=$(gh auth token) ...)")

    with open(template, encoding="utf-8") as f:
        text = f.read()
    if PLACEHOLDER not in text:
        sys.exit(f"error: {PLACEHOLDER} not found in {template}")
    text = text.replace(PLACEHOLDER, token.strip())
    if PLACEHOLDER in text:
        sys.exit("error: placeholder still present after substitution")

    with open(output, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)
    print(f"[render_setup] wrote {output} (token injected, not shown)")


if __name__ == "__main__":
    main()
