#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
# Copyright (C) 2017 Bitergia
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
import logging
import os
import os.path
import subprocess

description = """Create packages for pypi.

Example:
    build_pypi.py

"""

def parse_args ():

    parser = argparse.ArgumentParser(description = description)
    parser.add_argument("-l", "--logging", type=str, choices=["info", "debug"],
                        help = "Logging level for output")
    parser.add_argument("--logfile", type=str,
                            help = "Log file")

    args = parser.parse_args()
    return args

def run_command(args, cwd='/'):

    result = subprocess.run(args, cwd=cwd,
                        stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    if result.returncode == 0:
        success = True
        output_fn = logging.debug
        output_fn("Command successful")
    else:
        success = False
        output_fn = print
        output_fn("Command failed")
    output_fn('  command: ' + ' '.join(result.args))
    output_fn('  output: \n' + result.stdout.decode("utf-8", "backslashreplace"))
    if success == False:
        exit()
    return success

def clone_git(repo, dir):

    logging.debug("Cloning: " + dir)
    if not os.path.exists(dir):
        run_command(['git', 'clone', repo, dir])
        logging.debug("Cloned: " + dir)
    run_command(['git', '-C', dir, 'fetch'])
    logging.debug("Fetched: " + dir)
    run_command(['git', '-C', dir, 'checkout', 'HEAD'])
    logging.debug("Checked out: " + dir)

def build_pypi(pkg_dir, building_env, dist_dir):

    python = os.path.join(building_env, 'bin', 'python')
    setup_file = os.path.join(pkg_dir, 'setup.py')
    if os.path.isfile(setup_file):
        run_command([python, 'setup.py', 'sdist',
                        '--dist-dir=' + dist_dir],
                    cwd=pkg_dir)
        run_command([python, 'setup.py', 'bdist_wheel',
                        '--dist-dir=' + dist_dir],
                    cwd=pkg_dir)
        return True
    else:
        logging.info("Directory " + pkg_dir + "does not have a setup.py file.")
        return False

def main():
    args = parse_args()
    if args.logging:
        log_format = '%(levelname)s:%(message)s'
        if args.logging == "info":
            level = logging.INFO
        elif args.logging == "debug":
            level = logging.DEBUG
        if args.logfile:
            logging.basicConfig(format=log_format, level=level,
                                filename = args.logfile, filemode = "w")
        else:
            logging.basicConfig(format=log_format, level=level)

    modules = ['grimoirelab-toolkit', 'perceval', 'perceval-opnfv',
        'perceval-mozilla', 'GrimoireELK', 'sortinghat']
    dist_dir = '/tmp/dist'
    repos_dir = '/tmp/repos'
    if not os.path.exists(dist_dir):
        os.makedirs(dist_dir)
    if not os.path.exists(repos_dir):
        os.makedirs(repos_dir)

    for module in modules:
        module_repo = 'https://github.com/grimoirelab/' + module
        module_dir = os.path.join(repos_dir, module)
        cloned = clone_git(repo=module_repo, dir=module_dir)
        built = build_pypi(module_dir, building_env='/home/jgb/venvs/pip',
                    dist_dir=dist_dir)
        if built:
            print("Package " + module + ": OK")
        else:
            print("Package " + module + ": Error")

if __name__ == "__main__":
    main()
