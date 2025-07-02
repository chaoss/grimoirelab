{{/*
Helm chart templates
*/}}
{{- define "volume-mount.template" -}}
{{- range .Values.dependencies.storage.volumes }}
  - name: {{ .name }}
    mountPath: {{ .mountPath }}
    {{- if and (eq .type "configmap") (hasKey . "subPath") .subPath }}
    subPath: {{ .subPath }}
    {{- end }}
{{- end }}
{{- end }}

{{- define "volumes.template" -}}
- name: {{ .name }}
  {{- if eq .type "pvc" }}
  persistentVolumeClaim:
    claimName: {{ .name }}-pvc
  {{- else if eq .type "configmap" }}
  configMap:
    name: {{ $.Release.Name }}-configmap
    {{- if and (hasKey . "configmapKey") (hasKey . "asFile") .configmapKey .asFile }}
    items:
      - key: {{ .configmapKey }}
        path: {{ .asFile }}
    {{- end }}
  {{- else if eq .type "secret" }}
  secret:
    secretName: {{ .name }}-secret
  {{- else }}
  emptyDir:
    sizeLimit: 100Mi
  {{- end }}
{{- end }}

{{- define "resources.template" -}}
limits:
  cpu: {{ .Values.appConfig.resources.cpu.limits | quote }}
  memory: {{ .Values.appConfig.resources.memory.limits | quote }}
requests:
  cpu: {{ .Values.appConfig.resources.cpu.requests | quote }}
  memory: {{ .Values.appConfig.resources.memory.requests | quote }}
{{- end }}

{{- define "pvc.template" -}}
{{- range .Values.dependencies.storage.volumes }}
  {{- if eq .type "pvc" }}
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: {{ .name }}-pvc
  labels:
    app: "{{ $.Release.Name }}"
spec:
  storageClassName: "{{ .storageClass }}"
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: {{ .size }}
  {{- end }}
{{- end }}
{{- end }}

{{- define "service.template" -}}
ports:
  - protocol: TCP
    name: "{{ .Values.appConfig.name }}-service"
  {{- if eq .Values.service.scheme "http" }}
    port: 80
    targetPort: {{ .Values.service.targetPort }}
  {{- end }}
  {{- if eq .Values.service.scheme "https" }}
    port: 443
    targetPort: {{ .Values.service.targetPort }}
  {{- end }}
  {{- if eq .Values.service.scheme "passthrough" }}
    port: {{ .Values.service.targetPort }}
    targetPort: {{ .Values.service.targetPort }}
  {{- end }}
type: {{ .Values.service.type | default "ClusterIP" | quote }}
sessionAffinity: None
selector:
  app: "{{ .Values.appConfig.name }}"
{{- end }}
