{{/*
Sortinghat labels
*/}}
{{- define "metadata.sortinghat.pod.labels" -}}
{{- range $name, $value := .Values.appConfig.labels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Sortinghat annotations
*/}}
{{- define "metadata.sortinghat.pod.annotations" -}}
{{- range $name, $value := .Values.appConfig.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}


{{/*
Sortinghat Service labels
*/}}
{{- define "metadata.sortinghat.service.labels" -}}
{{- range $name, $value := .Values.service.labels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Sortinghat Service annotations
*/}}
{{- define "metadata.sortinghat.service.annotations" -}}
{{- range $name, $value := .Values.service.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

