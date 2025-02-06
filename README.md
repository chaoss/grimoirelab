# GrimoireLab

**This is the development branch of GrimoireLab 2.x. This software is unstable
and lacks of most of the features available in
[GrimoireLab 1.0](https://github.com/chaoss/grimoirelab). It's also subject
to change frequently. Use it under your own risk.**

GrimoireLab is an open source data platform for analytics and insights about
software development processes. The platform is extensible and modular, designed
to add new datasources, metrics, and analytics easily.

GrimoireLab is part of the [CHAOSS Project](http://chaoss.community), a Linux
Foundation project _focused on creating metrics, and software to better
understand open source community health_.

You can learn more about GrimoireLab in the [GrimoireLab tutorial](https://chaoss.github.io/grimoirelab-tutorial/),
or visiting the [GrimoireLab website](https://chaoss.github.io/grimoirelab).

## Installation

### Prerequisites

- Linux/MacOS (Windows not supported yet)
- Python >= 3.11
- MySQL >= 8.0/ MariaDB >= 11.4
- Redis database >= 7.4
- OpenSearch >= 2.0

To simplify the setup of the development environment, you can use the provided
[docker-compose-development.yml](./docker-compose/docker-compose-development.yml)
file. This file deploys the required services for running GrimoireLab in development
mode.

Due to this is a development branch, you will have to install
[poetry](https://python-poetry.org/) first, in order to get other dependencies
and packages. You can install it following its
[documentation](https://python-poetry.org/docs/#installation).

To build the frontend you will also need to install [yarn](https://yarnpkg.com/) and [node](https://nodejs.org/).
You can check how to install them following [the nvm](https://github.com/nvm-sh/nvm) and [yarn](https://yarnpkg.com/getting-started/install/) documentation.

- node >= 18.0
- yarn >= 4.0

### Steps

1. Clone the repository:

   ```bash
   git clone -b 2.x https://github.com/chaoss/grimoirelab.git
   cd grimoirelab
   ```

1. Install dependencies, core, and UI:

   ```bash
   poetry shell
   poetry update
   poetry install
   ```

### Usage

These are some easy steps to run GrimoireLab - based on a standard configuration.
Read the [configuration](#configuration) section below for understanding how
to configure the platform for your needs.

1. Setup GrimoireLab

   ```bash
   grimoirelab admin setup
   ```

2. Run GrimoireLab server

   ```bash
   grimoirelab run server --dev
   ```

3. Run GrimoireLab workers to fetch and eventize data

   ```bash
   grimoirelab run eventizers
   ```

4. Run GrimoireLab workers to store data

   ```bash
   grimoirelab run archivists
   ```

### Configuration

There are several configuration parameters that you can set before running
the platform. Most important ones are related to where your databases servers
are running and the users to connect to them. We recommend to use environment
variables to define new values.

```bash
export GRIMOIRELAB_SETTING=<NEW_VALUE>
```

Some environment variables you might need to change are:

- **GrimoireLab common settings**:
  - `GRIMOIRELAB_DEBUG`: to activate the debug mode (`true` or `false` values)
- **Redis configuration**
  - `GRIMOIRELAB_REDIS_HOST`: ip address of the server
  - `GRIMOIRELAB_REDIS_PORT`: port of the server
  - `GRIMOIRELAB_REDIS_PASSWORD`: password for the server
  - `GRIMOIRELAB_REDIS_DB`: database number used by GrimoireLab (`0` to `8` values)
- **MySQL/MariaDB configuration**
  - `GRIMOIRELAB_DB_HOST`: address of the server
  - `GRIMOIRELAB_DB_PORT`: port of the server
  - `GRIMOIRELAB_DB_USER`: user with admin permissions on the server
  - `GRIMOIRELAB_DB_PASSWORD`: user password to access the server
  - `GRIMOIRELAB_DB_DATABASE`: name of the database used by GrimoireLab
- **OpenSearch configuration**:
  - `GRIMOIRELAB_ARCHIVIST_STORAGE_URL`: URL address of the OpenSearch server (include user and password)
  - `GRIMOIRELAB_ARCHIVIST_STORAGE_INDEX`: name of the index where events will be stored

By default, GrimoireLab uses the configuration defined on the package
[grimoirelab.core.config.settings](https://github.com/chaoss/grimoirelab-core/blob/main/src/grimoirelab/core/config/settings.py).
Please refer to this file for default values.

You can use your own file passing it to commands either with the option `--config`
or with the environment variable `GRIMOIRELAB_CONFIG`.

## Contributing

The general norms for contributions are described in the
[CONTRIBUTING](./CONTRIBUTING.md) and [CONTRIBUTING WITH CODE](./CONTRIBUTING_WITH_CODE.md)
documents.

We use a roadmap to outline the direction of GrimoireLab. In the
[ROADMAP](./ROADMAP.md) document, we describe the vision and goals of
the project and what actions we'll take to achieve them.

You can also check the [governance rules](./GOVERNANCE.md) for our project and
community.

## License

This project is licensed under GNU General Public License (GPL), version 3 or
later - see the [LICENSE](./LICENSE.md) file for details.
