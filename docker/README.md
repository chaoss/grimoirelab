# Docker image for GrimoireLab

## Intro

This docker image runs a container preinstalled with a certain release of
GrimoireLab, including all libraries and programs.

## Requirements

* [Git](https://git-scm.com/)
* [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
* Recommended, 2CPUs, 8GB memory RAM, and 2GB SWAP (MacOS users can manage it 
with [Docker client for Mac](https://hub.docker.com/editions/community/docker-ce-desktop-mac))

## Build the image

To produce the image, run the following command from the `docker` directory:
```
$ docker build -f Dockerfile -t grimoirelab/grimoirelab:dev .
```

## Run the image

The easier way to start using the image is to use the provided 
[docker-compose file](../docker-compose/).

It provides a simple way to run the GrimoireLab components, including the
MariaDB database, a Redis server, and the GrimoireLab core.

Please, refer to that documentation for more information.

Using this image with `docker run` is also possible, but it requires a bit more
work and plenty of configuration.

This could be useful for running some specific commands like `perceval`:
```bash
$ docker run --rm grimoirelab/grimoirelab:dev perceval git https://github.com/chaoss/grimoirelab.git
```
