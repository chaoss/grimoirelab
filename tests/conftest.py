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

import concurrent.futures
import os
import random
import shutil
import subprocess
import tempfile
import time

import dulwich.repo
import pytest

from testcontainers.core.waiting_utils import wait_for_logs
from testcontainers.mysql import MySqlContainer
from testcontainers.opensearch import OpenSearchContainer
from testcontainers.redis import RedisContainer


mysql = MySqlContainer("mariadb:latest", root_password="root").with_exposed_ports(3306)
redis = RedisContainer(image="valkey/valkey:latest").with_exposed_ports(6379)
opensearch = OpenSearchContainer().with_exposed_ports(9200)


def generate_repository(repo_tmpdir, max_commits):
    """Create a temporary git repository.

    Each repository is created with a random number of commits. The parameter
    'max_commits' defines the maximum number of commits a repository can have.
    The last commit includes a 'summary.txt' file with the number of commits
    of the repository.

    :param max_commits: Maximum number of commits per repository.

    :return: filepath to the temporary directory
    """
    repo = dulwich.repo.Repo.init(repo_tmpdir, mkdir=True)

    num_commits = random.randint(1, max_commits)

    # Create empty commits
    for j in range(num_commits - 1):
        repo.do_commit(
            message=f"Commit #{j}".encode(),
            author=b"John Smith <jsmith@example.com>",
            committer=b"John Smith <jsmith@example.com>"
        )

    # Create the last commit with a summary file
    summary_file = os.path.join(repo_tmpdir, "summary.txt")
    with open(summary_file, 'w') as fd:
        fd.write(f"{str(num_commits)}\n")
        repo.stage("summary.txt")

    repo.do_commit(
        message=f"Commit #{num_commits - 1} - Summary".encode(),
        author=b"John Smith <jsmith@example.com>",
        committer=b"John Smith <jsmith@example.com>"
    )


@pytest.fixture
def setup_git_repositories(request, num_repositories, max_commits):
    """Create a number of temporary git repositories.

    This fixture uses threads to speed up the creation of the
    testing repositories.

    :param num_repositories: Number of repositories to create.
    :param max_commits: Maximum number of commits per repository.

    :return: filepath to the temporary directory
    """
    tmpdir = tempfile.mkdtemp(prefix="grimoirelab_")

    # Add a finalizer to remove the temporary directory
    def remove_tmpdir():
        shutil.rmtree(tmpdir)

    request.addfinalizer(remove_tmpdir)

    random.seed()

    processed = 0
    max_threads = 25

    while processed < num_repositories:
        to_process = min(max_threads, num_repositories - processed)

        with concurrent.futures.ThreadPoolExecutor() as executor:
            for i in range(to_process):
                repo_tmpdir = tempfile.mktemp(dir=tmpdir)
                executor.submit(generate_repository, repo_tmpdir, max_commits)

        processed += to_process

    return tmpdir


@pytest.fixture(scope="module")
def setup_mysql(request):
    mysql.start()

    def remove_container():
        mysql.stop()

    request.addfinalizer(remove_container)


@pytest.fixture(scope="module")
def setup_redis(request):
    redis.start()

    def remove_container():
        redis.stop()

    request.addfinalizer(remove_container)


@pytest.fixture(scope="module")
def setup_opensearch(request):
    opensearch.start()

    def remove_container():
        opensearch.stop()

    request.addfinalizer(remove_container)
    wait_for_logs(opensearch, ".*recovered .* indices into cluster_state.*")


@pytest.fixture(scope="module", autouse=True)
def setup_containers(setup_opensearch, setup_redis, setup_mysql):
    yield


@pytest.fixture(scope="module", autouse=True)
def setup_grimoirelab(request):
    os.environ["DJANGO_SETTINGS_MODULE"] = "grimoirelab.core.config.settings"
    os.environ["GRIMOIRELAB_REDIS_PORT"] = str(redis.get_exposed_port(6379))
    os.environ["GRIMOIRELAB_DB_PORT"] = str(mysql.get_exposed_port(3306))
    os.environ["GRIMOIRELAB_DB_PASSWORD"] = mysql.root_password
    os.environ["GRIMOIRELAB_ARCHIVIST_STORAGE_URL"] = f"http://localhost:{opensearch.get_exposed_port(9200)}"
    os.environ["GRIMOIRELAB_USER_PASSWORD"] = "admin"
    os.environ["GRIMOIRELAB_ARCHIVIST_BLOCK_TIMEOUT"] = "1000"

    subprocess.run(["grimoirelab", "admin", "setup"])
    subprocess.run(["grimoirelab", "admin", "create-user", "--username", "admin", "--no-interactive"])

    grimoirelab = subprocess.Popen(
        ["grimoirelab", "run", "server", "--dev"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
    )
    eventizers = subprocess.Popen(
        ["grimoirelab", "run", "eventizers", "--workers", "10"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
    )
    archivists = subprocess.Popen(
        ["grimoirelab", "run", "archivists", "--workers", "10"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
    )

    def stop_grimoirelab():
        # GrimoireLab uses uWSGI. It won't stop with SIGTERM,
        # so we need to use SIGKILL
        grimoirelab.kill()

        archivists.terminate()
        eventizers.terminate()

        # Wait for process to be done
        grimoirelab.wait()
        archivists.wait()
        eventizers.wait()

    request.addfinalizer(stop_grimoirelab)

    time.sleep(10)
