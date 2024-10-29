{{/*
Opensearch labels
*/}}
{{- define "opensearch-node-pod-labels" -}}
{{- range $name, $value := .Values.appConfiglabels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Opensearch annotations
*/}}
{{- define "opensearch-node-pod-annotations" -}}
{{- range $name, $value := .Values.appConfig.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}


{{/*
Opensearch Service labels
*/}}
{{- define "opensearch-node-service-labels" -}}
{{- range $name, $value := .Values.service.labels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Opensearch Service annotations
*/}}
{{- define "opensearch-node-service-annotations" -}}
{{- range $name, $value := .Values.service.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}