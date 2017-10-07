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
import tempfile

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
    parser.add_argument("--relfile", type=str,
                            help = "GrimoireLab coordinated release file. "
                                + "If not specified, master/HEAD will be used "
                                + "for each module.")

    parser.add_argument("--reposdir", type=str,
                            help = "Directory for storing git repositores. "
                                + "If not specified, use temporary directory, "
                                + "which will be wipped out when done.")
    parser.add_argument("--distdir", type=str,
                            help = "Directory for storing dist packages. "
                                + "If not specified, create a random directory.")

    args_venv = parser.add_mutually_exclusive_group(required=False)
    args_venv.add_argument("--venv", type=str,
                            help = "Python virtual environment to activate, "
                                + "install all needed modules in it.")
    args_venv.add_argument("--tmpvenv", action='store_true',
                            help = "Create and activate a temporary Python venv, "
                                + "install all needed modules in it. "
                                + "It will be wipped out when done.")

    args = parser.parse_args()
    return args

def extract_commits(file, commits):

    logging.debug("Reading coordinated release file")
    with open(file) as relfile:
        for line in relfile:
            line = line.strip().replace(' ','')
            parts = line.split('=')
            if len(parts) == 2:
                module = parts[0].lower().replace('_','-')
                commit = parts[1].strip("'")
                logging.debug("From release file: " + module + " " + commit)
                commits[module] = commit
    return commits

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

def update_venv(dir):

    build_dependencies = ['pip', 'setuptools', 'pypandoc', 'twine']
    pip_command = os.path.join(dir, 'bin', 'pip3')
    run_command([pip_command, 'install', '--upgrade'] + build_dependencies)

def create_venv(dir):

    run_command(['python3', '-m', 'venv', dir])

def clone_git(repo, dir, commit):

    logging.debug("Cloning: " + dir)
    if not os.path.exists(dir):
        run_command(['git', 'clone', repo, dir])
        logging.debug("Cloned: " + dir)
    logging.debug("Fetching: " + dir)
    run_command(['git', '-C', dir, 'fetch'])
    logging.debug("Fetched: " + dir)
    run_command(['git', '-C', dir, 'checkout', commit])
    logging.debug("Checked out: " + dir)

def build_pypi(pkg_dir, building_env, dist_dir):

    if building_env:
        python = os.path.join(building_env, 'bin', 'python3')
    else:
        python = 'python3'
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

def set_logging(args_logging, args_logfile=None):

    log_format = '%(levelname)s:%(message)s'
    if args_logging == "info":
        level = logging.INFO
    elif args_logging == "debug":
        level = logging.DEBUG
    if args_logfile:
        logging.basicConfig(format=log_format, level=level,
                            filename = args_logfile, filemode = "w")
    else:
        logging.basicConfig(format=log_format, level=level)

def main():
    args = parse_args()
    if args.logging:
        set_logging(args.logging, args.logfile)

    modules = ['grimoirelab-toolkit', 'perceval', 'perceval-opnfv',
        'perceval-mozilla', 'grimoireelk', 'sortinghat']
    commits = {
        'grimoirelab-toolkit': 'HEAD',
        'perceval': 'HEAD',
        'perceval-opnfv': 'HEAD',
        'perceval-mozilla': 'HEAD',
        'grimoireelk': 'HEAD',
        'sortinghat': 'HEAD'
    }
    if args.reposdir:
        repos_dir = args.reposdir
        if not os.path.exists(repos_dir):
            os.makedirs(repos_dir)
    else:
        tempdir = tempfile.TemporaryDirectory()
        repos_dir = tempdir.name
    logging.debug("Repos dir: " + repos_dir)

    if args.distdir:
        dist_dir = args.distdir
        if not os.path.exists(dist_dir):
            os.makedirs(dist_dir)
    else:
        dist_dir = tempfile.mkdtemp()
    logging.debug("Dist dir: " + dist_dir)

    if args.relfile:
        commits = extract_commits(file=args.relfile, commits=commits)
    logging.debug("Coordinated release info: " + str(commits))

    if args.tmpvenv:
        temp_dir = tempfile.TemporaryDirectory()
        venv_dir = temp_dir.name
        create_venv (venv_dir)
        update_venv (venv_dir)
    else:
        venv_dir = args.venv
        update_venv (venv_dir)

    for module in modules:
        module_repo = 'https://github.com/grimoirelab/' + module
        module_dir = os.path.join(repos_dir, module)
        if module in commits:
            commit = commits[module]
        else:
            commit = 'HEAD'
        cloned = clone_git(repo=module_repo, dir=module_dir, commit=commit)
        built = build_pypi(module_dir, building_env=venv_dir,
                    dist_dir=dist_dir)
        if built:
            print("Package " + module + ": OK")
        else:
            print("Package " + module + ": Error")
    print("Dist packages in " + dist_dir)
    print("Repos for source code in " + repos_dir)

if __name__ == "__main__":
    main()
