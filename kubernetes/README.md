# Introduction
This chart launches a grimoirelab deployment on a Kubernetes cluster using the helm package manager.


# Prerequisites Component
- Mariadb
- Redis
- Opensearch **(!)**
- Opensearch Dashboard **(!)**


**(!)**: A component with this mark means this chart is already integrated with that component.

You can deploy and configure the **(!)** component within this chart via `Values.yaml`.

If you like to bring your own components, you can disable the installation of the built-in chart, with `install: false` option *(see detail below)*.



# Installing the Chart

To install the chart with the release name `grimoirelab`
```console
helm install grimoirelab /path/to/chart --values /path/to/chart/values.yaml -n grimoirelab
```
`-n`: The namespace you would like to put this release in.




# Configure the chart

Tips: Use `Ctrl+F / Command+F` search the keywords in `Values.yaml` for quick navigation.




## Global

Global values are meant to override the specific values across all sub-charts.
| Name | Description | Type | Default value |
| ---- | ----------- | ---- | ------------- |
| `topologyConfig` | The topology configuration for this chart, affect all components | map | {} |
| `imagePullSecrets` | Only required when you are pulling image from private registry | list | [] |
| `appName` | Name of this chart | string | "" |
| `credentials.database.username` | Plaintext. Username for database connection | string | "root" |
| `credentials.database.password` | Plaintext. Password for the database connection | "mar1adb4Gr1m0ir3Lab" |
| `credentials.opensearchNode.password` | Plaintext. Password for the opensearch connection | string | "admin" |
| `credentials.redis.password` | Plaintext. Password for the redis connection | string | "grimoirelab" |


## Component

### Grimoirelab components

>  1. Components' names will be omitted.
>  2. Resource value has been set to a minimum running quota.
>  3. You can disable these components: `opensearch-node`, `opensearch-dashboard`, `mariadb`, `redis`.

| Name | Description | Type | Default value |
| ---- | ----------- | ---- | ------------- |
| `install` | Installation toggle for this component. | boolean | true / false |
| `appConfig.replicas` | Replica count for this deployment | int | 1 |
| `appConfig.image` | Image for this deployment | string | --- |
| `appConfig.labels` | Labels for this deployment | map | {} |
| `appConfig.annotations` | Annotations for this deployment | map | {} |
| `appConfig.resources` | Resources quota for this deployment | map | --- |




## Dependencies

### Storage

| Name | Description | Type | Default value |
| ---- | ----------- | ---- | ------------- |
| `enabled` | Enable or disable persistent storage. | boolean | true / false |
| `volumes.name` | Name of this volumes when referencing in yaml | string | --- |
| `volumes.mountPath` | Path of this volumes to be mount into container | string | --- |
| `volumes.type` | Type of this volumes. `pvc`, `configmap` or `emptyDir` | string | --- |
| `volumes.storageClass` | The storage class that will be used when creating PVC | string | gp3 |
| `volumes.size` | Size of this volume | string | --- |
| `volumes.subPath` | Declare the `subPath` while mounting in `configmap` type | string | --- |


 `volumes` have 3 types of schemas, here are the example:

#### 1.  Persistent Volume
```yaml
- name: "volume-name"
  mountPath: "/path/to/mount/in/container"
  type: pvc
  storageClass: your-storageClass
  size: 1Gi
```
This will result:
- A Persistence Volume Claim
  - With 1 Gigabyte storage
  - with the storageClass you assigned
- Mounted as Volumes with the name "volume-name"
  - in /path/to/mount/in/container



```yaml
- name: "volume-name"
  mountPath: "/path/to/mount/in/container"
  type: pvc
```
This will result:
- Mounted as Volumes with the name "volume-name". If these volumes are not created, the mounting attempt will fail.
  - in /path/to/mount/in/container
> If you did NOT declare the size, PVC will not be created. If these volumes have not been created, the mounting attempt will fail.



###  2. Configmap as file
```yaml
- name: "config-name"
  mountPath: "/path/to/file/in/container/file-name.txt"
  type: configmap
  subPath: "configmap-key-name"
```

This will result:
- Mounting file from Configmap with name "config-name".
  - in /path/to/mount/in/container
> If the configmap has NOT been created, or the key declared in "subPath" is not found in the configmap, the mounting attempt will fail.



###  3. Empty directory
```yaml
- name: "volume-name"
  mountPath: "path/to/mount/in/container"
  type: emptyDir
```

This will result:
- Mounted as an empty directory with the name "volume-name"
  - in /path/to/mount/in/container
> Data in this volume type will be lost when the pod is restarted.




## Service

| Name | Description | Type | Default value |
| ---- | ----------- | ---- | ------------- |
| `targetPort` | The port to expose for this deployment | int | --- |
| `schema` | The method when proxy the `targetPort`. `passthrough` will remain the original port, `http` will use 80 and `https` as 443 | string | passthrough |
| `type` | The type of the services for this deployment, default (empty) is `ClusterIP` | string | "" |

**Attention:** If you would like to change the service port in here, please make sure you have changed them in `templates/_ports.tpl` as well.



## Extra environments

You can put an extra environments list in here to inject into the container.
```yaml
- name: key
  value: "value"
- name: foo
  value: "bar"
```
