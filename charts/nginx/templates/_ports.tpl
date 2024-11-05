{{/*
Port catalogs for all services
*/}}
{{- define "nginx-listen.port" -}}
{{ ".Values.nginx.service.targetPort" | default "8000" }}
{{- end }}
