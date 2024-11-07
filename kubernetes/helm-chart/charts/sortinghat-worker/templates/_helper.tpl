{{/*
Sortinghat labels
*/}}
{{- define "metadata.sortinghatWorker.pod.labels" -}}
{{- range $name, $value := .Values.appConfig.labels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Sortinghat annotations
*/}}
{{- define "metadata.sortinghatWorker.pod.annotations" -}}
{{- range $name, $value := .Values.appConfig.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}


{{/*
Sortinghat Service labels
*/}}
{{- define "metadata.sortinghatWorker.service.labels" -}}
{{- range $name, $value := .Values.service.labels }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}

{{/*
Sortinghat Service annotations
*/}}
{{- define "metadata.sortinghatWorker.service.annotations" -}}
{{- range $name, $value := .Values.service.annotations }}
{{ $name }}: {{ $value | quote }}
{{- end -}}
{{- end -}}
