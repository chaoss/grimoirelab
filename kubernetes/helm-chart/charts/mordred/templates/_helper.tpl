{{/*
Mordred labels
*/}}
{{- define "mordred-pod-labels" -}}
{{- range $name, $value := .Values.appConfiglabels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Mordred annotations
*/}}
{{- define "mordred-pod-annotations" -}}
{{- range $name, $value := .Values.appConfig.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}


{{/*
Mordred Service labels
*/}}
{{- define "mordred-service-labels" -}}
{{- range $name, $value := .Values.service.labels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Mordred Service annotations
*/}}
{{- define "mordred-service-annotations" -}}
{{- range $name, $value := .Values.service.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}