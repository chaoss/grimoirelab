#!/usr/bin/python3
# -*- coding: utf-8 -*-
#
# Get the last commits for GrmoireLab repositories
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

import sys

import requests

MAX_REPOS = 20  # script does not paginate to get more than 20 items
ORG = 'grimoirelab'
GITHUB_REPOS_API = 'https://api.github.com/repos' + '/' + ORG
GITHUB_ORGS_API = 'https://api.github.com/orgs' + '/'+ ORG

def get_repositories():
    repos = []
    repos_url = GITHUB_ORGS_API + "/repos"
    res = requests.get(repos_url)
    res.raise_for_status()

    repos_dict = res.json()

    if len(repos_dict) >= MAX_REPOS:
        print("Max repositories reached: %i. Exiting." % MAX_REPOS)
        sys.exit(1)

    for repo in repos_dict:
        repos.append(repo['name'])

    return repos

if __name__ == '__main__':

    for repo in get_repositories():
        # Return the last commit from master branch
        commits_url = GITHUB_REPOS_API + "/" + repo + "/commits/master"
        res = requests.get(commits_url)
        res.raise_for_status()
        commit = res.json()['sha']
        print(repo.upper().replace("-", "_") + "='" + commit + "'")
