{{/*
Define various credentials recources
*/}}
{{- define "cred.database.username" -}}
  {{- $username := default "root" .Values.global.credentials.database.username -}}
  {{- $username -}}
{{- end }}

{{- define "cred.database.password" -}}
  {{- $password := default "mar1adb4Grim0ir3Lab" .Values.global.credentials.database.password -}}
  {{- $password -}}
{{- end }}

{{- define "cred.opensearchNode.password" -}}
  {{- $password := default "O54Grim0ir3Lab" .Values.global.credentials.opensearchNode.password -}}
  {{- $password -}}
{{- end }}

{{- define "cred.redis.password" -}}
  {{- $password := default "red1s4Grim0ir3Lab" .Values.global.credentials.redis.password -}}
  {{- $password -}}
{{- end }}

