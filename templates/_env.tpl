{{/*
Define various environment that referring from other values
*/}}
{{- define "nginx-extraEnvs.env" -}}
- name: KIBANA_HOST
  value: http://opensearch-dashboard:{{ include "opensearch-dashboard.port" . }}/
{{- end }}

{{- define "sortinghat-extraEnvs.env" -}}
- name: SORTINGHAT_DB_USER
  value: "{{ include "database-username.cred" . }}"
- name: SORTINGHAT_DB_PASSWORD
  value: "{{ include "database-password.cred" . }}"
- name: SORTINGHAT_REDIS_PASSWORD
  value: "{{ include "redis-password.cred" . }}"
- name: SORTINGHAT_CORS_ALLOWED_ORIGINS
  value: "http://localhost:{{ include "nginx-listen.port" . }},http://127.0.0.1:{{ include "nginx-listen.port" . }},http://0.0.0.0:{{ include "nginx-listen.port" . }}
{{- end }}

{{- define "sortinghat-worker-extraEnvs.env" -}}
- name: SORTINGHAT_DB_USER
  value: "{{ include "database-username.cred" . }}"
- name: SORTINGHAT_DB_PASSWORD
  value: "{{ include "database-password.cred" . }}"
- name: SORTINGHAT_REDIS_PASSWORD
  value: "{{ include "redis-password.cred" . }}"
{{- end }}

{{- define "opensearch-dashboard-extraEnvs.env" -}}
- name: OPENSEARCH_HOSTS
  value: "[\"https://opensearch-node:{{ include "opensearch-node.port" . }}\"]"
{{- end }}

{{- define "opensearch-node-extraEnvs.env" -}}
- name: OPENSEARCH_INITIAL_ADMIN_PASSWORD
  value: "{{ include "opensearch-node-password.cred" . }}"
{{- end }}

{{- define "mordred-extraEnvs.env" }}
{{- end }}