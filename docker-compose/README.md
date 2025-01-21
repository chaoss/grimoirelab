# Running GrimoireLab with docker-compose

This folder host configuration files to run GrimoireLab using 
[docker-compose](https://docs.docker.com/compose/), one of the 
easiest way to get started with GrimoireLab.

# Requirements

* A [Git](https://git-scm.com/) client
* [Docker Engine](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/)
* Recommended, at least, 2CPUs, 8GB memory RAM, and 2GB SWAP (MacOS users can manage it with [Docker client for Mac](https://hub.docker.com/editions/community/docker-ce-desktop-mac))

For example, in one of my latest demos, I was using:
```console
root@qiskit-6fc71ea6:~# git --version
git version 2.17.1
root@qiskit-6fc71ea6:~# docker --version
Docker version 19.03.1, build 74b1e89
root@qiskit-6fc71ea6:~# docker-compose --version
docker-compose version 1.22.0, build f46880fe
root@qiskit-6fc71ea6:~# free
              total        used        free      shared  buff/cache   available
Mem:        8167996     3463652      128844        1440     4575500     4413328
Swap:             0           0           0
root@qiskit-6fc71ea6:~# du -hs /
du: cannot access '/proc/2234/task/2234/fd/4': No such file or directory
du: cannot access '/proc/2234/task/2234/fdinfo/4': No such file or directory
du: cannot access '/proc/2234/fd/3': No such file or directory
du: cannot access '/proc/2234/fdinfo/3': No such file or directory
26G     /
```
**Note**: `free` and `du` are Linux utilities to display amount of free and used 
memory in the system, and to estimate file space usage, respectively.

You should ensure [enough virtual memory for OpenSearch](https://opensearch.org/docs/latest/install-and-configure/install-opensearch/index/#important-settings) 
(one of GrimoireLab components). You can do it running the following command as `root` in Linux or as administrator user in MacOS:

## Linux
```console
sysctl -w vm.max_map_count=262144
```

## Mac
```
$ screen ~/Library/Containers/com.docker.docker/Data/vms/0/tty
(then run:) sysctl -w vm.max_map_count=262144
```

Remember also to assign proper resources to Docker through the UI. 8GB Memory and 2GB Swap should work.

![](./mac-docker-configuration.png)

# Getting started in 3 steps

1. Clone this project:
```console
git clone https://github.com/chaoss/grimoirelab
```

3. Access to [`docker-compose`](./) folder and deploy GrimoireLab running this command:
```console
cd grimoirelab/docker-compose
docker-compose up -d
```

If everything goes well, you could access to the tasks at `http://localhost:8000/`
and see the status of the jobs.

To manage contributors profile information with [SortingHat](https://github.com/chaoss/grimoirelab-sortinghat),
go to `http://localhost:8000/identities/`. To get access:
* User: `admin`
* Pass: `admin`

**Note**: you can change user and password in the `docker-compose.yml` file.

## Common questions

### How to stop and restart deployed software infrastructure?

There might be 2 potential scenarios:

1. If you want to do a simple configuration change and restart the platform:
```console
docker-compose restart
```
2. If you want to destroy current deployed configuration, and after some changes,
start from fresh one:
```console
docker-compose down
```
and once they are *down*:
```console
docker-compose up -d
```

