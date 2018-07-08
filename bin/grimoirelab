#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
# Copyright (C) 2015-2018 Bitergia
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, 51 Franklin Street, Fifth Floor, Boston, MA 02110-1335, USA.
#
# Authors:
#     Jesus M. Gonzalez-Barahona <jgb@bitergia.com>
#

import argparse
import sys

import grimoirelab

description = """Dumb GrimoireLab front-end.

Actually, does not drive GrimoireLab tools, but let's you know which version
of them is installed in your system. More info about GrimoireLab:

https://chaoss.github.io/grimoirelab

Example:
    grimoirelab --version
"""

def main():
    args = parse_args()


def parse_args():
    """Parse command line arguments"""

    parser = argparse.ArgumentParser(description=description)

    parser.add_argument('-v', '--version', action='version',
                        version="GrimoireLab " + grimoirelab.__version__,
                        help="Version of GrimoireLab installed")

    if len(sys.argv) == 1:
        parser.print_help(sys.stderr)
        sys.exit(1)

    return parser.parse_args()


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        s = "\n\nReceived Ctrl-C or other break signal. Exiting.\n"
        sys.stderr.write(s)
        sys.exit(0)
