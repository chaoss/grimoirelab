{{/*
Sortinghat labels
*/}}
{{- define "sortinghat-worker-pod-labels" -}}
{{- range $name, $value := .Values.appConfiglabels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Sortinghat annotations
*/}}
{{- define "sortinghat-worker-pod-annotations" -}}
{{- range $name, $value := .Values.appConfig.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}


{{/*
Sortinghat Service labels
*/}}
{{- define "sortinghat-worker-service-labels" -}}
{{- range $name, $value := .Values.service.labels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Sortinghat Service annotations
*/}}
{{- define "sortinghat-worker-service-annotations" -}}
{{- range $name, $value := .Values.service.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}