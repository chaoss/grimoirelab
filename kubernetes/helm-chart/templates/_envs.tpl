{{/*
Define various environment that referring from other values
*/}}
{{- define "nativeEnv.nginx" -}}
- name: KIBANA_HOST
  value: "http://opensearch-dashboard:{{ include "port.opensearchDashboard" . }}/"
{{- end }}

{{- define "nativeEnv.sortinghat" -}}
- name: SORTINGHAT_DB_USER
  value: "{{ include "cred.database.username" . }}"
- name: SORTINGHAT_DB_PASSWORD
  value: "{{ include "cred.database.password" . }}"
- name: SORTINGHAT_REDIS_PASSWORD
  value: "{{ include "cred.redis.password" . }}"
- name: SORTINGHAT_CORS_ALLOWED_ORIGINS
  value: "http://localhost:{{ include "port.nginxListen" . }},http://127.0.0.1:{{ include "port.nginxListen" . }},http://0.0.0.0:{{ include "port.nginxListen" . }}"
{{- end }}

{{- define "nativeEnv.sortinghatWorker" -}}
- name: SORTINGHAT_DB_USER
  value: "{{ include "cred.database.username" . }}"
- name: SORTINGHAT_DB_PASSWORD
  value: "{{ include "cred.database.password" . }}"
- name: SORTINGHAT_REDIS_PASSWORD
  value: "{{ include "cred.redis.password" . }}"
{{- end }}

{{- define "nativeEnv.opensearchDashboard" -}}
- name: OPENSEARCH_HOSTS
  value: "[\"https://opensearch-node:{{ include "port.opensearchNode" . }}\"]"
{{- end }}

{{- define "nativeEnv.opensearchNode" -}}
- name: OPENSEARCH_INITIAL_ADMIN_PASSWORD
  value: "{{ include "cred.opensearchNode.password" . }}"
{{- end }}

{{- define "nativeEnv.mordred" }}
{{- end }}
