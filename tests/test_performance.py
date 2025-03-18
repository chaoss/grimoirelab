# -*- coding: utf-8 -*-
#
# Copyright (C) GrimoireLab Developers
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
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#

from __future__ import annotations

import os
import time

import pytest
import opensearchpy

from .utils import GrimoireLabClient


@pytest.mark.parametrize(
    "num_repositories,max_commits,timeout",
    [(10, 1000, 60), (100, 100, 120), (1000, 100, 300)]
)
def test_git_performance(setup_git_repositories, timeout):
    """Analysis of git repositories should be under a certain time limit.

    The tests create a pre-defined number of repositories with a random
    number of commits. The analysis should be completed before a certain
    timeout. After the timeout, the number of events obtained for every
    repository have to match with the number commits in that repository.
    """
    tmpdir = setup_git_repositories

    grimoirelab_client = GrimoireLabClient(
        "http://127.0.0.1:8000", "admin", "admin"
    )
    grimoirelab_client.connect()

    repositories = []

    for entry in os.scandir(tmpdir):
        if entry.is_dir() and not entry.name.startswith('.'):
            repo_tmpdir = os.path.join(tmpdir, entry.name)
            repositories.append(repo_tmpdir)

            data = {
                "uri": f"file://{repo_tmpdir}",
                "datasource_type": "git",
                "datasource_category": "commit"
            }

            res = grimoirelab_client.post("datasources/add_repository", json=data)
            res.raise_for_status()

    # Analysis should have finished before the timeout
    time.sleep(timeout)

    os_conn = opensearchpy.OpenSearch(
        hosts=os.environ["GRIMOIRELAB_ARCHIVIST_STORAGE_URL"],
        http_compress=True,
        verify_certs=False,
        ssl_assert_hostname=False,
        ssl_show_warn=False,
        max_retries=5,
        retry_on_timeout=True,
    )

    for repo in repositories:
        query = opensearchpy.Search(using=os_conn, index="events")
        query = query.filter("match", source=f"file://{repo}")
        query = query.filter("term", type="org.grimoirelab.events.git.commit")

        ncommits = int(query.count())

        filepath = os.path.join(repo, "summary.txt")
        with open(filepath, 'r') as fp:
            expected = int(fp.read().strip('\n'))
            assert ncommits == expected
