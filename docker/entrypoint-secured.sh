#!/bin/bash

# Start ElasticSearch, MariaDB and Kibana, wait for them to be listening,
# and launch SirMordred with the options in the CMD line of the Dockerfile

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

sudo /usr/share/elasticsearch/plugins/search-guard-6/tools/sgadmin.sh -cd /usr/share/elasticsearch/plugins/search-guard-6/sgconfig -icl -key /etc/elasticsearch/kirk-key.pem -cert /etc/elasticsearch/kirk.pem -cacert /etc/elasticsearch/root-ca.pem -nhnv
status=$?
if [ $status -ne 0 ]; then
  echo "Failed to configure Elasticsearch / SearchGuard: $status"
  exit $status
fi

echo "Elasticsearch / SearchGuard configured."

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

# Start Kibiter (ensure passwd is the one in /kibanauser.pass)
sed -i "s/elasticsearch.password: \"XXX\"/elasticsearch.password: \"$(cat /kibanauser.pass)\"/" ${KB}-linux-x86_64/config/kibana.yml

echo "Starting Kibiter"
${KB}-linux-x86_64/bin/kibana > kibana.log 2>&1 &

echo "Waiting for Kibiter to start..."
#sleep .2
#sudo netstat -cvulntp |grep -m 1 ".*:5601.*LISTEN.*"
#until $(curl -k --output /dev/null --silent --head --fail "http://127.0.0.1:5601/login#?_g=()" ); do
until $(curl -k --output /dev/null --silent --head --fail "https://admin:admin@127.0.0.1:5601/" ); do
    printf '.'
    sleep 2
done
echo "Kibiter started"

if [[ $RUN_MORDRED ]] && [[ $RUN_MORDRED = "NO" ]]; then
  echo
  echo "All services up, not running SirMordred because RUN_MORDRED = NO"
  echo "Get a shell running docker exec, for example:"
  echo "docker exec -it" $(hostname) "env TERM=xterm /bin/bash"
else
  sleep 1
  # Start SirMordred
  echo "Starting SirMordred to build a GrimoireLab dashboard"
  echo "This will usually take a while..."
  /usr/local/bin/sirmordred $*
  status=$?
  if [ $status -ne 0 ]; then
    echo "Failed to start SirMordred: $status"
    exit $status
  fi
  echo
  echo "SirMordred done, dasboard produced, check https://localhost:5601"
  echo
  echo "To make this shell finish, type <CTRL> C"
  echo "but the container will still run services in the background,"
  echo "including Kibiter and Elasticsearch, so you can still operate the dashboard."
fi
echo
echo "To make the whole container finish, type 'docker kill " $(hostname) "'"
sleep 5000d
