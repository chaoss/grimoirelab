#!/usr/bin/python3
# -*- coding: utf-8 -*-
#
# Get the last commits for GrimoireLab repositories
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
# Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
#
# Authors:
#   Alvaro del Castillo San Felix <acs@bitergia.com>
#


import requests

GITHUB_REPOS_API = 'https://api.github.com/repos'

GRIMOIRELAB_API = GITHUB_REPOS_API + '/grimoirelab'

REPOSITORIES = ['arthur', 'GrimoireELK', 'grimoirelab-toolkit', 'mordred',
                'panels', 'perceval', 'perceval-opnfv', 'perceval-mozilla',
                'perceval-puppet', 'reports', 'sortinghat']

def get_params():
    parser = argparse.ArgumentParser(usage="usage:last_commits [options]",
                                     description="Get last commits from " + \
                                                 "GrimoireLab GitHub repositories")

    return parser.parse_args()

if __name__ == '__main__':

    args = get_params()

    for repo in REPOSITORIES:
        # Return the last commit from master branch
        commits_url = GRIMOIRELAB_API + "/" + repo + "/commits/master"
        res = requests.get(commits_url)
        res.raise_for_status()
        commit = res.json()['sha']
        print(repo.upper() + "='" + commit + "'")
