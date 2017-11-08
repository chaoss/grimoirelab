# Copyright (C) 2016-2017 Bitergia
# GPLv3 License

FROM debian:stretch-slim
MAINTAINER Jesus M. Gonzalez-Barahona <jgb@bitergia.com>

ENV DEBIAN_FRONTEND noninteractive
ENV DEPLOY_USER grimoirelab
ENV DEPLOY_USER_DIR /home/${DEPLOY_USER}
ENV SCRIPTS_DIR ${DEPLOY_USER_DIR}/scripts

# Initial user
RUN useradd ${DEPLOY_USER} --create-home --shell /bin/bash

# install dependencies
RUN apt-get update && \
    apt-get -y install --no-install-recommends \
        bash locales \
        git git-core \
        python3 \
        python3-pip \
        python3-venv \
        mariadb-client \
        unzip curl wget sudo ssh \
        && \
    apt-get clean && \
    find /var/lib/apt/lists -type f -delete

RUN echo "${DEPLOY_USER} ALL=NOPASSWD: ALL" >> /etc/sudoers

RUN mkdir -p ${DEPLOY_USER_DIR}/logs ; chown -R ${DEPLOY_USER}:${DEPLOY_USER} ${DEPLOY_USER_DIR}/logs
VOLUME ["/home/grimoirelog/logs"]

ADD stage ${DEPLOY_USER_DIR}/stage
RUN chmod 755 ${DEPLOY_USER_DIR}/stage

RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    echo 'LANG="en_US.UTF-8"'>/etc/default/locale && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8

#ADD cacert.pem ${DEPLOY_USER_DIR}/cacert.pem
#RUN CERT_PATH=`python3 -m requests.certs` && \
#    cat ${DEPLOY_USER_DIR}/cacert.pem >> ${CERT_PATH}

ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
ENV LANG C.UTF-8

USER ${DEPLOY_USER}
WORKDIR ${DEPLOY_USER_DIR}

CMD ${DEPLOY_USER_DIR}/stage
