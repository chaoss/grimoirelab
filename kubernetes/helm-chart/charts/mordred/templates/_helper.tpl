{{/*
Mordred labels
*/}}
{{- define "metadata.mordred.pod.labels" -}}
{{- range $name, $value := .Values.appConfig.labels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Mordred annotations
*/}}
{{- define "metadata.mordred.pod.annotations" -}}
{{- range $name, $value := .Values.appConfig.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}


{{/*
Mordred Service labels
*/}}
{{- define "metadata.mordred.service.labels" -}}
{{- range $name, $value := .Values.service.labels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Mordred Service annotations
*/}}
{{- define "metadata.mordred.service.annotations" -}}
{{- range $name, $value := .Values.service.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

