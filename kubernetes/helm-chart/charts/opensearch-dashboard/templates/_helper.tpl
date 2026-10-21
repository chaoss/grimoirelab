{{/*
Opensearch Dashboard labels
*/}}
{{- define "metadata.opensearchDashboard.pod.labels" -}}
{{- range $name, $value := .Values.appConfig.labels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Opensearch Dashboard annotations
*/}}
{{- define "metadata.opensearchDashboard.pod.annotations" -}}
{{- range $name, $value := .Values.appConfig.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}


{{/*
Opensearch Dashboard Service labels
*/}}
{{- define "metadata.opensearchDashboard.service.labels" -}}
{{- range $name, $value := .Values.service.labels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Opensearch Dashboard Service annotations
*/}}
{{- define "metadata.opensearchDashboard.service.annotations" -}}
{{- range $name, $value := .Values.service.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

