#!/bin/bash

# Start ElasticSearch, MariaDB and Kibana, wait for them to be listening,
# and launch Mordred with the options in the CMD line of the Dockerfile

echo "Starting container:" $(hostname)

# Start Elasticsearch
echo "Starting Elasticsearch"
sudo chown -R elasticsearch.elasticsearch /var/lib/elasticsearch
sudo /etc/init.d/elasticsearch start
status=$?
if [ $status -ne 0 ]; then
  echo "Failed to start Elasticsearch: $status"
  exit $status
fi

echo "Waiting for Elasticsearch to start..."
sudo netstat -cvulntp |grep -m 1 ".*:9200.*LISTEN.*"
echo "Elasticsearch started"

# Start MariaDB
echo "Starting MariaDB"
sudo /etc/init.d/mysql start
status=$?
if [ $status -ne 0 ]; then
  echo "Failed to start MariaDB: $status"
  exit $status
fi

echo "Waiting for MariaDB to start..."
sudo netstat -cvulntp |grep -m 1 ".*:3306.*LISTEN.*"
echo "MariaDB started"

# Start Kibana
echo "Starting Kibiter"
${KB}-linux-x86_64/bin/kibana > kibana.log 2>&1 &

echo "Waiting for Kibiter to start..."
#sleep .2
#sudo netstat -cvulntp |grep -m 1 ".*:5601.*LISTEN.*"
until $(curl --output /dev/null --silent --head --fail http://127.0.0.1:5601); do
    printf '.'
    sleep 2
done
echo "Waiting for Kibiter index to be created..."
until $(curl --output /dev/null --silent --fail http://127.0.0.1:9200/.kibana/config/_search ); do
    printf '.'
    sleep 2
done
echo "Kibiter started"

if [[ $RUN_MORDRED ]] && $RUN_MORDRED = "NO" ; then
  echo
  echo "All services up, not running Mordred because $RUN_MORDRED = NO"
  echo "Get a shell running docker exec, for example:"
  echo "docker exec -it" $(hostname) "env TERM=xterm /bin/bash"
else
  sleep 1
  # Start Mordred
  echo "Starting Mordred to build a GrimoireLab dashboard"
  echo "This will usually take a while..."
  /usr/local/bin/mordred $*
  status=$?
  if [ $status -ne 0 ]; then
    echo "Failed to start Mordred: $status"
    exit $status
  fi
  echo
  echo "Mordred done, dasboard produced, check http://localhost:5601"
  echo
  echo "To make this shell finish, type <CTRL> C"
  echo "but the container will still run services in the background,"
  echo "including Kibiter and Elasticsearch, so you can still operate the dashboard."
fi
echo
echo "To make the whole container finish, type 'docker kill " $(hostname) "'"
sleep 5000d
