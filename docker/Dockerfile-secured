# Copyright (C) 2016-2018 Bitergia
# GPLv3 License
#
# The container produced with this file contains all
# GrimoireLab libraries and executables, and is configured
# for running Mordred by default, producing a fully Functional
# GrimoireLab dashboard.
#
# It also contains all services needed to produce a dashboard
# using Mordred: Elasticsearch, MariaDB, and Kibana.
#
# It is secured using SearchGuard plugins for Elasticsearch
# and Kibiter.
#
# Usually it will be run as:
#
# $ docker run -p 9200:9200 -p 5601:5601 -v $(pwd)/logs:/logs \
#   -v $(pwd)/mordred-local-full-jgb.cfg:/mordred-local.cfg -t grimoirelab/full
#
FROM grimoirelab/full
MAINTAINER Jesus M. Gonzalez-Barahona <jgb@bitergia.com>

ENV SG_VERSION=6.1.4-22.4
ENV SG_KVERSION=6.1.4-12
USER root

# SearchGuard configuration for Elasticsearch
RUN /usr/share/elasticsearch/bin/elasticsearch-plugin install -b com.floragunn:search-guard-6:${SG_VERSION} && \
    cd /usr/share/elasticsearch/plugins/search-guard-6/tools/ && \
    rm install_demo_configuration.sh && \
    wget https://raw.githubusercontent.com/floragunncom/search-guard/master/tools/install_demo_configuration.sh && \
    chmod 755 install_demo_configuration.sh && \
    ./install_demo_configuration.sh -y && \
    echo "searchguard.enterprise_modules_enabled: false" >> \
    	 /etc/elasticsearch/elasticsearch.yml

ADD docker/sg_roles_mapping.yml /usr/share/elasticsearch/plugins/search-guard-6/sgconfig/sg_roles_mapping.yml

# Launch Elasticsearch, wait until it starts
#    sed -e "s|anonymous_auth_enabled: false$|anonymous_auth_enabled: true|" -i /usr/share/elasticsearch/plugins/search-guard-6/sgconfig/sg_config.yml && \

#RUN /etc/init.d/elasticsearch start && \
#    netstat -cvulntp |grep -m 1 ".*:9300.*LISTEN.*" && \
#    /usr/share/elasticsearch/plugins/search-guard-6/tools/sgadmin.sh -cd /usr/share/elasticsearch/plugins/search-guard-6/sgconfig -icl -key /etc/elasticsearch/kirk-key.pem -cert /etc/elasticsearch/kirk.pem -cacert /etc/elasticsearch/root-ca.pem -nhnv

# Create self-signed certificate for Kibana
RUN openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 \
      -subj "/C=EU/ST=Any/L=All/O=Dis/CN=localhost" \
      -out /host.cert -keyout /host.key && \
    cp -a /host.cert /ca.cert && \
    chown grimoirelab.grimoirelab /host.cert /host.key /ca.cert

RUN echo -n 'kibanaserver' > /kibanauser.pass

USER ${DEPLOY_USER}

# Install SearchGuard Kibana plugin, and its config files
RUN cd ${DEPLOY_USER_DIR}/${KB}-linux-x86_64 && \
    bin/kibana-plugin install "https://search.maven.org/remotecontent?filepath=com/floragunn/search-guard-kibana-plugin/${SG_KVERSION}/search-guard-kibana-plugin-${SG_KVERSION}.zip" && \
    echo 'elasticsearch.username: "kibanaserver"' >> config/kibana.yml && \
    echo 'elasticsearch.password: "XXX"' >> config/kibana.yml && \
    echo 'elasticsearch.url: "https://localhost:9200"' >> config/kibana.yml && \
    echo 'elasticsearch.ssl.verificationMode: none' >> config/kibana.yml && \
    echo 'searchguard.basicauth.enabled: true' >> config/kibana.yml && \
    echo 'server.ssl.enabled: true' >> config/kibana.yml && \
    echo 'server.ssl.key: /host.key' >> config/kibana.yml && \
    echo 'server.ssl.certificate: /host.cert' >> config/kibana.yml && \
    echo 'elasticsearch.ssl.certificateAuthorities: [ "/ca.cert" ]' >> config/kibana.yml

# It seems this line works only in enterprise mode
#    echo 'searchguard.readonly_mode.roles: ["sg_read_only_1"]' >> config/kibana.yml && \

# Add mordred configuration file for infra
ADD docker/mordred-infra-ssl.cfg /infra.cfg

# Entrypoint script
ADD docker/entrypoint-secured.sh /entrypoint.sh
RUN sudo chmod 755 /entrypoint.sh

# Entrypoint
ENTRYPOINT [ "/entrypoint.sh" ]
CMD [ "-c", "/infra.cfg", "/dashboard.cfg", "/project.cfg", "/override.cfg"]
