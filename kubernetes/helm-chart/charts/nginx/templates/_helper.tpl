{/*
Mordred labels
*/}}
{{- define "nginx-pod-labels" -}}
{{- range $name, $value := .Values.appConfiglabels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Mordred annotations
*/}}
{{- define "nginx-pod-annotations" -}}
{{- range $name, $value := .Values.appConfig.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}


{{/*
Mordred Service labels
*/}}
{{- define "nginx-service-labels" -}}
{{- range $name, $value := .Values.service.labels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Mordred Service annotations
*/}}
{{- define "nginx-service-annotations" -}}
{{- range $name, $value := .Values.service.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}