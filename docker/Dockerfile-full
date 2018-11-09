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
# Usually it will be run as:
#
# $ docker run -p 9200:9200 -p 5601:5601 -v $(pwd)/logs:/logs \
#   -v $(pwd)/mordred-local-full-jgb.cfg:/mordred-local.cfg -t grimoirelab/full
#
FROM grimoirelab/installed
MAINTAINER Jesus M. Gonzalez-Barahona <jgb@bitergia.com>

ENV ES=elasticsearch-6.1.4
ENV KB_VERSION=6.1.4-1
ENV KB_TAG=community-v${KB_VERSION}
ENV KB=kibiter-${KB_VERSION}
ENV KB_DIR=${KB}-linux-x86_64

USER root

# Install OpenJDK-8 & netstat (for monitoring)
RUN mkdir /usr/share/man/man1 && \
    apt-get update && \
    apt-get -y install --no-install-recommends openjdk-8-jdk-headless \
      net-tools

# Install ElasticSearch
RUN wget -nv https://artifacts.elastic.co/downloads/elasticsearch/${ES}.deb && \
    wget -nv https://artifacts.elastic.co/downloads/elasticsearch/${ES}.deb.sha512 && \
    sudo dpkg -i ${ES}.deb && \
    rm ${ES}.deb ${ES}.deb.sha512
RUN sed -e "/MAX_MAP_COUNT=/s/^/#/g" -i /etc/init.d/elasticsearch && \
    echo "http.host: 0.0.0.0" >> /etc/elasticsearch/elasticsearch.yml && \
    echo "cluster.routing.allocation.disk.watermark.flood_stage: 99.9%" >> /etc/elasticsearch/elasticsearch.yml && \
    echo "cluster.routing.allocation.disk.watermark.low: 99.9%" >> /etc/elasticsearch/elasticsearch.yml && \
    echo "cluster.routing.allocation.disk.watermark.high: 99.9%" >> /etc/elasticsearch/elasticsearch.yml
EXPOSE 9200

# Install MariaDB
RUN apt-get -y install --no-install-recommends mariadb-server
RUN echo "mysqld_safe &" > /tmp/config && \
    echo "mysqladmin --silent --wait=30 ping || exit 1" >> /tmp/config && \
    echo "mysql -e 'CREATE USER grimoirelab;'" >> /tmp/config && \
    echo "mysql -e 'GRANT ALL PRIVILEGES ON *.* TO \"grimoirelab\"@\"%\" WITH GRANT OPTION;'" >> /tmp/config && \
    bash /tmp/config && \
    rm -f /tmp/config && \
    sed -e "/bind-address/s/^/#/g" -i /etc/mysql/mariadb.conf.d/50-server.cnf
EXPOSE 3306

USER ${DEPLOY_USER}

# Install Kibana (as DEPLOY_USER)
RUN wget -nv https://github.com/grimoirelab/kibiter/releases/download/${KB_TAG}/${KB_DIR}.tar.gz && \
    tar xzf ${KB_DIR}.tar.gz && \
    rm ${KB_DIR}.tar.gz && \
    sed -e "s|^#server.host: .*$|server.host: 0.0.0.0|" -i ${KB_DIR}/config/kibana.yml
# Run Kibana until optimization is done, to avoid optimizing every
# time the image is run
RUN ${KB_DIR}/bin/kibana 2>&1 | grep -m 1 "Optimization of .* complete in .* seconds"

RUN sudo /etc/init.d/elasticsearch start && \
    ${KB_DIR}/bin/kibana 2>&1 > /dev/null & \
    ( until $(curl --output /dev/null --silent --fail http://127.0.0.1:9200/.kibana/config/_search ); do \
        printf '.' && \
        sleep 2 && \
        curl -XPOST "http://127.0.0.1:5601/api/kibana/settings/indexPattern:placeholder" \
          -H 'Content-Type: application/json' -H 'kbn-version: '${KB_VERSION} \
          -H 'Accept: application/json' -d '{"value": "*"}' \
          --silent --output /dev/null ; \
    done )

EXPOSE 5601

ADD docker/entrypoint-full.sh /entrypoint.sh
RUN sudo chmod 755 /entrypoint.sh

#VOLUME /var/lib/elasticsearch

# Entrypoint
ENTRYPOINT [ "/entrypoint.sh" ]
CMD [ "-c", "/infra.cfg", "/dashboard.cfg", "/project.cfg", "/override.cfg"]
