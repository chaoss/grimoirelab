{{/*
Opensearch Dashboard labels
*/}}
{{- define "opensearch-dashboard-pod-labels" -}}
{{- range $name, $value := .Values.appConfiglabels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Opensearch Dashboard annotations
*/}}
{{- define "opensearch-dashboard-pod-annotations" -}}
{{- range $name, $value := .Values.appConfig.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}


{{/*
Opensearch Dashboard Service labels
*/}}
{{- define "opensearch-dashboard-service-labels" -}}
{{- range $name, $value := .Values.service.labels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Opensearch Dashboard Service annotations
*/}}
{{- define "opensearch-dashboard-service-annotations" -}}
{{- range $name, $value := .Values.service.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}