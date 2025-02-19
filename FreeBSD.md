# Install GrimoireLab on FreeBSD

GrimoireLab is an open-source software suite for software development analytics. This guide explains how to install and configure GrimoireLab on FreeBSD.

## Prerequisites

Before starting, ensure your FreeBSD system is up to date:

```
# freebsd-update fetch install
# pkg update && pkg upgrade
```

## Install GrimoireLab and Required Dependencies

```
# pkg install -y www/py-grimoirelab opensearch opensearch-dashboards redis security/py-certbot mysql80-server uwsgi ca_root_nss
```

## Securing OpenSearch

Securing OpenSearch is a complex task that depends on site and organizational policies. Necessary security measures should be taken according to the organization's policy, following best practices outlined in [Security in OpenSearch](https://opensearch.org/docs/latest/security/).  OpenSearch and GrimoireLab can be deployed and run in various ways on FreeBSD. One approach is to run OpenSearch in a separate FreeBSD jail while hosting the dashboard and GrimoireLab application in another jail. However, this documentation assumes that all components are running on a single host or within a single jail. If multiple jails or external hosts are used, appropriate security policies must be adopted as per OpenSearch documentation.

## Configuring OpenSearch

Provided that proper security was configured OpenSearch service should be started:
```
# service opensearch enable
# service opensearch start
```

## Configuring OpenSearch Dashboard

Provided that proper security was configured OpenSearch Dashboard should be configured with the appropriate credentials. The minimum configuration changes required to run are like the following. Modify the file `/usr/local/etc/opensearch-dashboards/opensearch_dashboards.yml`:

```
opensearch.hosts: [http://localhost:9200]
opensearch.username: kibanaserver
opensearch.password: <PASSWORD_CONFIGURED_IN_OPENSEARCH_FOR_KIBANASERVER>
opensearch_security.readonly_mode.roles: [kibana_read_only]
# Use this setting if running opensearch-dashboards without https
opensearch_security.cookie.secure: false
```

Depending on various dashboards some Dashboards plugins might be required.  Plugins have different versions corresponding to the OpenSearch Dashboards version. Check the necessary documentation of the plugins for the required version corresponding to the OpenSearch Dashboards. For OpenSearch Dashboards 2.17.1 the `enhanced-table` plugin needs to be installed as this is required for the Bugzilla related Dashboards. The plugin can be installed in the following way:

```
# /usr/local/www/opensearch-dashboards/bin/opensearch-dashboards-plugin install https://github.com/fbaligand/kibana-enhanced-table/releases/download/v1.14.0/enhanced-table-1.14.0_osd-2.17.1.zip
```

Enable and start the OpenSearch Dashboard service:
```
# service opensearch_dashboards enable
# service opensearch_dashboards start
```

## Configuring Redis

Add the following configurations in the file `/usr/local/etc/redis.conf`:
```
user grimoire on ><YOUR__REDIS_PASSWORD_HERE> ~* +@keyspace -@all
```
Please be mindful about the `>` symbol which is a literal `>` rather than a part of the password.

Enable and start the `redis` service:
```
# service redis enable
# service redis start
```
## Configuring MySQL

Enable and start the MySQL service:
```
# service mysql-server enable
# service mysql-server start
```
Secure the MySQL service by running `mysql_secure_installation`. The test databases should be removed, anonymous access should be disabled and a password should be set for the `root` user. Follow the prompt of the application.

Create a new user and a database to be used by the Grimoirelab application. The database is mainly used by SortingHat to store the relationships between different individuals and their respective organizations. The database also helps to consolidate different identification of the same individual in different platforms.

```
# mysql -u root -p
Enter password:
root@localhost [(none)]> CREATE DATABASE grimoire CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
root@localhost [(none)]> CREATE USER 'grimoire'@'localhost' IDENTIFIED BY 'YOUR_MYSQL_PASSWORD_HERE';
root@localhost [(none)]> GRANT ALL ON grimoire.* TO 'grimoire'@'localhost';
root@localhost [(none)]> FLUSH PRIVILEGES;
```

## Configuring and setting up SortingHat

SortingHat is the component that is used to consolidate different identities in a single identity. This is a django based application. Despite it comes with a daemon to run on it's own however there are some complications running this on FreeBSD with pkg as the daemon is optimized for running while using only `virtualenv`. To overcome this issue another application server which can handle WSGI is required. There are many options in the wild for such but this document will concentrate on uwsgi only.

Run the following commands to initialize the SortingHat database and create an admin user:

```
# export SORTINGHAT_ALLOWED_HOST=grimoire.example.org
# export SORTINGHAT_DB_USER=grimoire
# export SORTINGHAT_DB_PASSWORD=<YOUR_MYSQL_PASSWORD_HERE>
# export SORTINGHAT_DB_DATABASE=grimoire
# export SORTINGHAT_DB_HOST=127.0.0.1
# export SORTINGHAT_CORS_ALLOWED_ORIGINS=["https://grimoire.example.org"]
# export SORTINGHAT_REDIS_HOST=127.0.0.10
# export SORTINGHAT_REDIS_PORT=6379
# export SORTINGHAT_REDIS_PASSWORD=<YOUR_REDIS_PASSWORD_HERE>
# export SORTINGHAT_WORKERS_ASYNC=True
# export SORTINGHAT_REDIS_DB=0
# sortinghat-admin --config sortinghat.config.settings setup
```

## Configuring and setting up uWSGI

Running a django application requires a secret key which will be generated in the following way:
```
# LC_ALL=C tr -dc 'A-Za-z0-9!"#$%&'\''()*+,-./:;<=>?@[\]^_`{|}~' </dev/urandom | head -c 40; echo
```

`uwsgi` service in FreeBSD looks for the file in `/usr/local/etc/uwsgi/uwsgi.ini` but this file is not created by default. So create the file with the following contents:
```
[uwsgi]
# Django project directory
chdir = /usr/local/lib/python3.11/site-packages/sortinghat

# Django's wsgi file
module = sortinghat.app.wsgi:application

# Set the socket (TCP) and bind it to the specified address and port
socket = 127.0.0.1:9314
chmod-socket = 664
uid = www
gid = www

# Set the number of worker processes and threads (from the environment or
# default values)
workers = 2
threads = 4

# Enable threading
enable-threads = true

# Set master process
master = true

# Load the application lazily
lazy-apps = true

# Single interpreter mode
single-interpreter = true

# Environment variable for Django settings module
env = DJANGO_SETTINGS_MODULE=sortinghat.config.settings
env = SORTINGHAT_SECRET_KEY='<KEY_GENERATED_IN_PREVIOUS_STEP>'

env = SORTINGHAT_ALLOWED_HOST=grimoire.example.org
env = SORTINGHAT_DB_USER=grimoire
env = SORTINGHAT_DB_PASSWORD=<YOUR_MYSQL_PASSWORD_HERE>
env = SORTINGHAT_DB_DATABASE=grimoire
env = SORTINGHAT_DB_HOST=127.0.0.1
env = SORTINGHAT_CORS_ALLOWED_ORIGINS=["https://grimoire.example.org"]
env = SORTINGHAT_REDIS_HOST=127.0.0.1
env = SORTINGHAT_REDIS_PORT=6379
env = SORTINGHAT_REDIS_PASSWORD=<YOUR_REDIS_PASSWORD_HERE>
env = SORTINGHAT_WORKERS_ASYNC=True
env = SORTINGHAT_REDIS_DB=0
```
Enable and start the service:
```
# service uwsgi enable
# service uwsgi start
```

## Configuring Nginx

A web server or reverse proxy is required to serve the multiple components. In this case Nginx will be used. An example configuration of Nginx might be like the following.

```
	upstream sortinghat {
		server 127.0.0.1:9314;
	}

	server {
		listen       80 default_server;
		server_name  grimoire.example.org;

		# Redirect HTTP to HTTPS
		location / {
			return 301 https://$server_name$request_uri;
		}

		access_log  /var/log/nginx/grimoire.example.org.access.log  main;
	}

	server {
		listen 443 ssl;
		listen [::]:443 ssl;
		http2 on;
		server_name grimoire.example.org;

		access_log  /var/log/nginx/grimoire.example.org.access.log  main;
		error_log  /var/log/nginx/grimoire.example.org.error.log;
		# ECC
		ssl_certificate /usr/local/etc/ssl/certs/grimoire.example.org_ecc.crt;
		ssl_certificate_key /usr/local/etc/ssl/certs/grimoire.example.org_ecc.key;
		# RSA
		ssl_certificate /usr/local/etc/ssl/certs/grimoire.example.org.crt;
		ssl_certificate_key /usr/local/etc/ssl/certs/grimoire.example.org.key;
		ssl_session_timeout 1d;
		ssl_session_cache shared:SSL:1m;
		ssl_session_tickets off;

		ssl_protocols TLSv1.3;
		ssl_prefer_server_ciphers off;

		# HSTS (ngx_http_headers_module is required) (63072000 seconds)
		add_header Strict-Transport-Security "max-age=63072000" always;

		# OCSP stapling
		ssl_stapling on;
		ssl_stapling_verify on;
		ssl_trusted_certificate /usr/local/share/certs/ca-root-nss.crt;
		resolver 127.0.0.1;
		resolver_timeout 2s;

		# Proxy Opensearch Dashboard
		location / {
			proxy_pass http://localhost:5601;
			proxy_set_header Host $host;
			proxy_set_header X-Real-IP $remote_addr;
			proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
			proxy_set_header X-Forwarded-Proto $scheme;

			# WebSocket support
			proxy_http_version 1.1;
			proxy_set_header Upgrade $http_upgrade;
			proxy_set_header Connection "upgrade";
		}

		location /identities {
			rewrite ^/identities/(.*) /$1 break;
			include uwsgi_params;
			uwsgi_pass 127.0.0.1:9314;
			uwsgi_param Host $host;
			uwsgi_param X-Real-IP $remote_addr;
			uwsgi_param X-Forwarded-For $proxy_add_x_forwarded_for;
			uwsgi_param X-Forwarded-Proto $http_x_forwarded_proto;
		}
		location ~ ^/identities/(css|js|fonts)/ {
			rewrite ^/identities/(.*) /$1 break;
			root /usr/local/lib/python3.11/site-packages/sortinghat/static;
		}
	}
}
```

Enable and start the Nginx service as following:
```
# service nginx enable
# service nginx start
```

## Enable and start SirMordred

```
# service sirmordred enable
# service sirmordred start
```
Once the service is started it will take some time to be visible in the Dashboards depending on the size of the git repository or bugzilla instance. If the above configurations were used the logs will be visible at `/var/log/mordred/all.log`.

The dashboards that were used to deploy the [FreeBSD Grimoire instance](https://grimoire.freebsd.org] are available from [here](https://github.com/freebsd/grimoire). At the moment the dashboards are limited for BugZilla analysis. In future there are possibilities of adding git analysis and the necessary dashboards will be added.
