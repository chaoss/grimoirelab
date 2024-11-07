{{/*
Port catalogs for all services
*/}}
{{- define "sortinghat-worker.port" -}}
{{ ".Values.sortinghat-worker.service.targetPort" | default "9314" }}
{{- end }}
