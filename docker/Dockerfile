# Copyright (C) 2016-2022 Bitergia
# GPLv3 License

FROM node:18 AS build-core-static

RUN git clone --depth 1 https://github.com/chaoss/grimoirelab-core.git

WORKDIR /grimoirelab-core/ui

RUN yarn install && yarn build


FROM python:3.11-slim-bullseye

LABEL maintainer="Santiago Dueñas <sduenas@bitergia.com>"

ENV DEBIAN_FRONTEND noninteractive
ENV DEPLOY_USER grimoirelab
ENV DEPLOY_USER_DIR /home/${DEPLOY_USER}
ENV CONF_DIR ${DEPLOY_USER_DIR}/conf
ENV SCRIPTS_DIR ${DEPLOY_USER_DIR}/scripts
ENV GRIMOIRELAB_RELEASE "2.x"

# Create a user and a group
RUN groupadd -r $DEPLOY_USER && useradd -r -m -g $DEPLOY_USER $DEPLOY_USER

# Install dependencies
RUN apt-get update && \
    apt-get -y install --no-install-recommends \
        bash locales \
        gcc \
        git git-core \
        mariadb-client \
        libmariadbclient-dev-compat \
        unzip curl wget sudo ssh \
        && \
    apt-get clean && \
    find /var/lib/apt/lists -type f -delete

RUN echo "${DEPLOY_USER} ALL=NOPASSWD: ALL" >> /etc/sudoers

RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    echo 'LANG="en_US.UTF-8"'>/etc/default/locale && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8

ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
ENV LANG C.UTF-8

USER ${DEPLOY_USER}

# Install GrimoireLab and dependencies
#
# We use a virtual environment because it makes easier
# to find the exact location of the packages installed
# and where the static files are available.

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="$DEPLOY_USER_DIR/.local/bin:$PATH"

ENV \
    # Disable some unused uWSGI features, saving dependencies
    # Thanks to https://stackoverflow.com/a/25260588/90297
    UWSGI_PROFILE_OVERRIDE=ssl=false;xml=false;routing=false

WORKDIR ${DEPLOY_USER_DIR}
RUN git clone -b 2.x --depth 1 https://github.com/chaoss/grimoirelab.git

WORKDIR ${DEPLOY_USER_DIR}/grimoirelab

USER root

RUN python -m venv /opt/venv/ && \
    . /opt/venv/bin/activate && \
    poetry update && \
    poetry install

COPY --from=build-core-static /grimoirelab-core/src/grimoirelab/core/templates/ /opt/venv/lib/python3.11/site-packages/grimoirelab/core/templates/

RUN chown -R $DEPLOY_USER:$DEPLOY_USER /opt/venv

RUN mkdir /core_static/
COPY --from=build-core-static /grimoirelab-core/src/grimoirelab/core/templates/static/ /core_static/
RUN chown -R $DEPLOY_USER:$DEPLOY_USER /core_static/

COPY ./entrypoint.sh /usr/local/bin/
RUN chmod 755 /usr/local/bin/entrypoint.sh

USER ${DEPLOY_USER}

ENTRYPOINT ["entrypoint.sh"]
CMD ["grimoirelab"]
