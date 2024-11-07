{{/*
Common Helm chart templates abstract
*/}}


{{- define "template.volumeMount" -}}
{{- range .Values.dependencies.storage.volumes }}
- name: {{ .name }}
  mountPath: {{ .mountPath }}
  {{- if and (eq .type "configmap") (hasKey . "subPath") .subPath }}
  subPath: {{ .subPath }}
  {{- end }}
{{- end }}
{{- end }}


{{- define "template.volumes" -}}
- name: {{ .item.name }}
  {{- if eq .item.type "pvc" }}
  persistentVolumeClaim:
    claimName: {{ .item.name }}-pvc
  {{- else if eq .item.type "configmap" }}
  configMap:
    name: {{ .root.Release.Name }}-configmap
    {{- if and (hasKey .item "configmapKey") (hasKey .item "asFile") }}
    items:
      - key: {{ .item.configmapKey }}
        path: {{ .item.asFile }}
    {{- end }}
  {{- else if eq .item.type "secret" }}
  secret:
    secretName: {{ .item.name }}-secret
  {{- else }}
  emptyDir:
    sizeLimit: 100Mi
  {{- end }}
{{- end }}


{{- define "template.resQuota" -}}
limits:
  cpu: {{ .Values.appConfig.resources.cpu.limits | quote }}
  memory: {{ .Values.appConfig.resources.memory.limits | quote }}
requests:
  cpu: {{ .Values.appConfig.resources.cpu.requests | quote }}
  memory: {{ .Values.appConfig.resources.memory.requests | quote }}
{{- end }}


{{- define "template.pvc" -}}
  {{- if and (eq .item.type "pvc") (hasKey .item "size" ) }}
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: {{ .item.name }}-pvc
  labels:
    app: "{{ .root.Release.Name }}"
spec:
  storageClassName: "{{ .item.storageClass }}"
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: {{ .item.size }}
  {{- end }}
{{- end }}


{{- define "template.service" -}}
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
