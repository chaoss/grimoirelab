# Copyright (C) 2016-2022 Bitergia
# GPLv3 License

FROM python:3.12-slim-bullseye

LABEL maintainer="Santiago Dueñas <sduenas@bitergia.com>"

ARG GRIMOIRELAB_RELEASE="2.x"

ENV DEBIAN_FRONTEND=noninteractive
ENV DEPLOY_USER=grimoirelab
ENV GRIMOIRELAB_RELEASE=${GRIMOIRELAB_RELEASE}

# Create a user and a group
RUN groupadd -r $DEPLOY_USER && useradd -r -m -g $DEPLOY_USER $DEPLOY_USER

# Install dependencies
RUN apt-get update && \
    apt-get -y install --no-install-recommends \
        bash locales \
        gcc \
        git git-core \
        mariadb-client \
        pkg-config \
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

ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8
ENV LANG=C.UTF-8

ENV \
    # Disable some unused uWSGI features, saving dependencies
    # Thanks to https://stackoverflow.com/a/25260588/90297
    UWSGI_PROFILE_OVERRIDE=ssl=false;xml=false;routing=false

# Install GrimoireLab and dependencies
#
# We use a virtual environment because it makes easier
# to find the exact location of the packages installed
# and where the static files are available.

RUN python -m venv /opt/venv/ && \
    . /opt/venv/bin/activate && \
    pip install grimoirelab==${GRIMOIRELAB_RELEASE}

RUN chown -R $DEPLOY_USER:$DEPLOY_USER /opt/venv

# Make static files available in a known location
RUN mkdir /opt/venv/lib/python3.12/site-packages/grimoirelab/core/static/
RUN chown -R $DEPLOY_USER:$DEPLOY_USER /opt/venv/lib/python3.12/site-packages/grimoirelab/core/static/
RUN ln -s /opt/venv/lib/python3.12/site-packages/grimoirelab/core/static/ /core_static

COPY ./entrypoint.sh /usr/local/bin/
RUN chmod 755 /usr/local/bin/entrypoint.sh

USER ${DEPLOY_USER}

ENTRYPOINT ["entrypoint.sh"]
CMD ["grimoirelab"]
