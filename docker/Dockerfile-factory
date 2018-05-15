# Copyright (C) 2016-2017 Bitergia
# GPLv3 License
#
# Build GrimoireLab packages, install them, check them
#

FROM debian:stretch-slim
MAINTAINER Jesus M. Gonzalez-Barahona <jgb@bitergia.com>

ENV DEBIAN_FRONTEND=noninteractive
ENV DEPLOY_USER=grimoirelab
ENV DEPLOY_USER_DIR=/home/${DEPLOY_USER}
ENV DIST_SCRIPT=/usr/local/bin/build_grimoirelab \
    LOGS_DIR=/logs \
    DIST_DIR=/dist \
    REL_FILE=/release

# install dependencies
RUN apt-get update && \
    apt-get -y install --no-install-recommends \
        bash locales \
        gcc \
        git git-core \
        pandoc \
        python3 \
        python3-pip \
        python3-venv \
        python3-dev \
        python3-gdbm \
        mariadb-client \
        unzip curl wget sudo ssh \
        && \
    apt-get clean && \
    find /var/lib/apt/lists -type f -delete

# Initial user and dirs
RUN useradd ${DEPLOY_USER} --create-home --shell /bin/bash ; \
    echo "${DEPLOY_USER} ALL=NOPASSWD: ALL" >> /etc/sudoers ; \
    mkdir ${DIST_DIR} ; chown -R ${DEPLOY_USER}:${DEPLOY_USER} ${DIST_DIR} ; \
    mkdir ${LOGS_DIR} ; chown -R ${DEPLOY_USER}:${DEPLOY_USER} ${LOGS_DIR}

RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    echo 'LANG="en_US.UTF-8"'>/etc/default/locale && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8

ENV LANG=en_US.UTF-8 \
    LANGUAGE=en_US:en \
    LC_ALL=en_US.UTF-8 \
    LANG=C.UTF-8

# Add script to create distributable packages
ADD utils/build_grimoirelab ${DIST_SCRIPT}
RUN chmod 755 ${DIST_SCRIPT}

USER ${DEPLOY_USER}
WORKDIR ${DEPLOY_USER_DIR}

ADD releases/latest ${REL_FILE}

# Unbuffered output for Python, so that we see messages as they are produced
ENV PYTHONUNBUFFERED 0
# Entrypoint (build GrimoireLab packages), and default arguments for it
ENTRYPOINT [ "/usr/local/bin/build_grimoirelab", "--distdir", "/dist", \
    "-l", "debug", "--logfile", "/logs/build.log" ]
CMD [ "--build", "--install", "--check", "--test", "--fail", "--relfile", "/release" ]
