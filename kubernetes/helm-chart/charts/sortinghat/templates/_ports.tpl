{{/*
Port catalogs for all services
*/}}
{{- define "sortinghat.port" -}}
{{ ".Values.sortinghat.service.targetPort" | default "9314" }}
{{- end }}
