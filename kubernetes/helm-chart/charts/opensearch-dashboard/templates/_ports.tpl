{{/*
Port catalogs for all services
*/}}
{{- define "opensearch-dashboard.port" -}}
{{ ".Values.opensearch-dashboard.service.targetPort" | default "5601" }}
{{- end }}
