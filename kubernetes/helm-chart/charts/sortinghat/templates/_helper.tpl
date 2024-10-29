{{/*
Sortinghat labels
*/}}
{{- define "sortinghat-pod-labels" -}}
{{- range $name, $value := .Values.appConfig.labels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Sortinghat annotations
*/}}
{{- define "sortinghat-pod-annotations" -}}
{{- range $name, $value := .Values.appConfig.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}


{{/*
Sortinghat Service labels
*/}}
{{- define "sortinghat-service-labels" -}}
{{- range $name, $value := .Values.service.labels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Sortinghat Service annotations
*/}}
{{- define "sortinghat-service-annotations" -}}
{{- range $name, $value := .Values.service.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}