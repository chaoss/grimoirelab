{{/*
Port catalogs for all services

{{- define "port.sortinghat" -}}
{{- printf .Values.sortinghat.service.targetPort | default "9314" }}
{{- end }}

{{- define "port.sortinghatWorker" -}}
{{- printf .Values.sortinghatWorker.service.targetPort | default "9314" }}
{{- end }}

{{- define "port.nginxListen" -}}
{{- printf .Values.nginx.service.targetPort | default "8000" }}
{{- end }}

{{- define "port.opensearchNode" -}}
{{- printf .Values.opensearchNode.service.targetPort | default "9200" }}
{{- end }}

{{- define "port.opensearchDashboard" -}}
{{- printf .Values.opensearchDashboard.service.targetPort | default "5601" }}
{{- end }}
*/}}

{{- define "port.sortinghat" -}}
  {{- $sortinghat := default 9314 -}}
  {{- $sortinghat -}}
{{- end }}

{{- define "port.sortinghatWorker" -}}
  {{- $sortinghatWorker := default 9314 -}}
  {{- $sortinghatWorker -}}
{{- end }}

{{- define "port.nginxListen" -}}
  {{- $nginxListen := default 8000 -}}
  {{- $nginxListen -}}
{{- end }}

{{- define "port.opensearchNode" -}}
  {{- $opensearchNode := default 9200 -}}
  {{- $opensearchNode -}}
{{- end }}

{{- define "port.opensearchDashboard" -}}
  {{- $opensearchDashboard := default 5601 -}}
  {{- $opensearchDashboard -}}
{{- end }}

