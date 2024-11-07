{{/*
Opensearch labels
*/}}
{{- define "metadata.opensearchNode.pod.labels" -}}
{{- range $name, $value := .Values.appConfig.labels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Opensearch annotations
*/}}
{{- define "metadata.opensearchNode.pod.annotations" -}}
{{- range $name, $value := .Values.appConfig.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}


{{/*
Opensearch Service labels
*/}}
{{- define "metadata.opensearchNode.service.labels" -}}
{{- range $name, $value := .Values.service.labels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Opensearch Service annotations
*/}}
{{- define "metadata.opensearchNode.service.annotations" -}}
{{- range $name, $value := .Values.service.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}
