{{/*
Port catalogs for all services
*/}}
{{- define "opensearch-node.port" -}}
{{ ".Values.opensearch-node.service.targetPort" | default "9200" }}
{{- end }}
