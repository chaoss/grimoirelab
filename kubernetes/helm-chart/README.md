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

To install the chart with the release name `grimoirelab`:
```console
helm install grimoirelab /path/to/chart --values /path/to/chart/values.yaml -n grimoirelab
```
`-n`: The namespace you would like to put this release in.

After installation, visit grimoirelab (opensearch-dashboard) homepage with:
`http://`opensearch_dashboard_ip`:5601`

To visualise data, you need to import dashboards into opensearch-dashboard.

  1. Visit https://github.com/chaoss/grimoirelab-sigils/tree/master/panels/json/opensearch_dashboards
  2. Download the dashboard you are interested
  3. Open opensearch-dashboard console in your browser, login.
  4. [If its the first install] Click "Explore on my own".
  5. Click "Menu" on the top left corner, then go to "Management" - "Dashboard Management"
  6. [If its the first install] Click "Index patterns" on the left to create the index patterns.
  7. Click "Saved objects" on the left to import "ndjson" dashboard file you downloaded.
  8. Drag or browser the dashboard file, select, then click "Import" - "Done" to import the dashboard.


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
| `credentials.database.password` | Plaintext. Password for the database connection | string | "mar1adb4Gr1m0ir3Lab" |
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


# If you would like to bring your own databases and more...
Here are the strings you need to replace.

## Database
| Name | Description | Type | Default value |
| ---- | ----------- | ---- | ------------- |
| `SORTINGHAT_DB_HOST` | Database connection address, IP address or URL, without HTTP header | string | "mariadb" |
| `SORTINGHAT_DB_PORT` | Database connection port | string | "3306" |
| `SORTINGHAT_REDIS_HOST` | Redis connection address, IP address or URL, without HTTP header | string | "redis-master" |

## Opensearch and Dashboard
| Location | Key | Description | Type | Default value |
| -------- | --- | ----------- | ---- | ------------- |
| `templates/_envs.tpl` | `KIBANA_HOST` | Opensearch dashboard url | string | http://opensearch-dashboard: |
| `templates/_envs.tpl` | `OPENSEARCH_HOSTS` | Opensearch node url | string | https://opensearch-node: |
| `charts/mordred/templates/_mordred_config.tpl` | `es_collection.url` | Opensearch node url | string | @opensearch-node |
| `charts/mordred/templates/_mordred_config.tpl` | `es_enrichment.url` | Opensearch node url | string | @opensearch-node |
