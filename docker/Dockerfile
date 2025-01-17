# Copyright (C) 2016-2022 Bitergia
# GPLv3 License

FROM python:3.9-slim-bullseye
LABEL maintainer="Santiago Dueñas <sduenas@bitergia.com>"

ENV DEBIAN_FRONTEND noninteractive
ENV DEPLOY_USER grimoire
ENV DEPLOY_USER_DIR /home/${DEPLOY_USER}
ENV CONF_DIR ${DEPLOY_USER_DIR}/conf
ENV SCRIPTS_DIR ${DEPLOY_USER_DIR}/scripts
ENV GRIMOIRELAB_RELEASE "1.9.2"

# Initial user
RUN useradd ${DEPLOY_USER} --create-home --shell /bin/bash

# install dependencies
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

RUN mkdir -p ${DEPLOY_USER_DIR}/logs ; chown -R ${DEPLOY_USER}:${DEPLOY_USER} ${DEPLOY_USER_DIR}/logs
VOLUME ["${DEPLOY_USER_DIR}/logs"]

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

# Download basic configuration files
ADD https://raw.githubusercontent.com/chaoss/grimoirelab-sirmordred/main/aliases.json ${DEPLOY_USER_DIR}/aliases.json
RUN chmod 444 ${DEPLOY_USER_DIR}/aliases.json
ADD https://raw.githubusercontent.com/chaoss/grimoirelab-sirmordred/main/menu.yaml ${DEPLOY_USER_DIR}/menu.yaml
RUN chmod 444 ${DEPLOY_USER_DIR}/menu.yaml

ADD stage ${DEPLOY_USER_DIR}/stage
RUN chmod 755 ${DEPLOY_USER_DIR}/stage

USER ${DEPLOY_USER}

# Do the deployment for GRIMOIRELAB_RELEASE

WORKDIR ${DEPLOY_USER_DIR}

RUN mkdir -p ${CONF_DIR} && \
    git clone -b ${GRIMOIRELAB_RELEASE} --depth 1 https://github.com/grimoirelab/grimoirelab.git && \
    cp grimoirelab/requirements.txt ${CONF_DIR}/requirements.txt && \
    echo ${GRIMOIRELAB_RELEASE} > ${DEPLOY_USER_DIR}/release && \
    echo "Installing and checking GrimoireLab Release"
RUN sudo pip install -r ${CONF_DIR}/requirements.txt

HEALTHCHECK --interval=60s --timeout=6s --retries=1 CMD healthcheck.py -c ${CONF_DIR}/setup.cfg -s 'Exception in Task Manager' || exit 1

CMD ${DEPLOY_USER_DIR}/stage
