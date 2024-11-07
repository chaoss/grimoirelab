{{/*
uwsgi params config for nginx
*/}}
{{- define "config.uwsgiParams" -}}
uwsgi_param QUERY_STRING $query_string;
uwsgi_param REQUEST_METHOD $request_method;
uwsgi_param CONTENT_TYPE $content_type;
uwsgi_param CONTENT_LENGTH $content_length;
uwsgi_param REQUEST_URI $request_uri;
uwsgi_param PATH_INFO $document_uri;
uwsgi_param DOCUMENT_ROOT $document_root;
uwsgi_param SERVER_PROTOCOL $server_protocol;
uwsgi_param HTTPS $https if_not_empty;
uwsgi_param REMOTE_ADDR $remote_addr;
uwsgi_param REMOTE_PORT $remote_port;
uwsgi_param SERVER_PORT $server_port;
uwsgi_param SERVER_NAME $server_name;
{{- end }}

{{/*
nginx config
*/}}
{{- define "config.nginxConf" -}}
upstream sortinghat {
  server sortinghat:{{ include "port.sortinghat" . }};
}
server {
  include    mime.types;
  sendfile on;
  listen {{ include "port.nginxListen" . }};

  server_name localhost nginx;

  location / {
      proxy_pass ${KIBANA_HOST};
      proxy_redirect ${KIBANA_HOST} /;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
  }

  location /identities {
      rewrite ^/identities/(.*) /$1 break;

      include /etc/nginx/uwsgi_params;
      uwsgi_pass sortinghat;
      uwsgi_param Host $host;
      uwsgi_param X-Real-IP $remote_addr;
      uwsgi_param X-Forwarded-For $proxy_add_x_forwarded_for;
      uwsgi_param X-Forwarded-Proto $http_x_forwarded_proto;
  }

  location ~ ^/identities/(css|js|fonts)/ {
    rewrite ^/identities/(.*) /$1 break;

    root /sortinghat;
  }
}
{{- end }}
