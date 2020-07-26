# Running GrimoireLab with Kubernetes

In this folder are configuration manifests for deploying GrimoireLab using [Kubernetes](https://kubernetes.io). You will need a functional Kubernetes cluster, and you should be able to deploy both versions on k8s, kind, or minikube. There are certainly other options out there as well.

# Requirements

* [Git](https://git-scm.com/) client
* Kubernetes 1.17+ (managed or local, including kind, minikube, or k3s)
* [kubectl client](https://kubernetes.io/docs/tasks/tools/install-kubectl/) and admin credentials to aforementioned Kubernetes cluster

# Getting Started

1. Clone this project:
```console
git clone https://github.com/chaoss/grimoirelab
```

2. Since it's impossible to reference external files from within yaml, the configuration templates provided in [`default-grimoirelab-settings`](../default-grimoirelab-settings) are copied to various config/secret maps.

* [`30-hatstall-config.yml`] - Contains [`apache-hatstall.conf`](../default-grimoirelab-settings/apache-hatstall.conf)
* [`31-hatstall-secret.yml`] - Contains [`shdb.cfg`](../default-grimoirelab-settings/shdb.cfg)
* [`50-mordred-config.yml`] - Contains [`projects.json`](../default-grimoirelab-settings/projects.json) and [`identities.yml`](../default-grimoirelab-settings/identities.yml)
* [`51-mordred-config-aliases.yml`] - Contains [`aliases.json`](../default-grimoirelab-settings/aliases.json)
* [`52-mordred-config-identities.yml`] - Contains [`identities.yml`](../default-grimoirelab-settings/identities.yml)
* [`53-mordred-secret.yml`] - Contains [`setup.cfg`](../default-grimoirelab-settings/setup.cfg)

The two files you'll likely want to modify at first are `50-mordred-config.yml`, which includes the relevant project locations in `projects.json` in addition to `53-mordred-secret.yml`, which contains all the configuration settings for collecting the data for your projects. This includes api keys, passwords, and other important artifacts.

See [below](#more-information) more information about these files format.

3. Launch the project and use `port-forward` as shown in this example to access the dashboard.

```console
cd grimoirelab/kubernetes/secure
kubectl apply -f .
kubectl port-forward service/kibiter 5601 -n grimoire
```

Launch your browser and navigate to `http://localhost:5601`, and login with the user name `admin` and password `admin`.

To manage the contributors identities, you may port-forward the [Hatstall](https://github.com/chaoss/grimoirelab-hatstall) application as well.

```console
kubectl port-forward service/hatstall 8000:80 -n grimoire
```

Once forwarded, access your browser at `http://localhost:8000`, and login using the user name `admin`, and password `admin`

---

## Using an insecure environment

Follow the same steps as above, but use the manifests in the `insecure` folder.


# More information

* [The `projects.json` file format](https://github.com/chaoss/grimoirelab-sirmordred#projectsjson)
* [The `setup.cfg` file format](https://github.com/chaoss/grimoirelab-sirmordred#setupcfg)
* Getting API tokens for different services:
  * [GitHub](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line)
  * [GitLab](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html)
  * [Meetup](https://secure.meetup.com/es-ES/meetup_api/oauth_consumers/)
  * [Slack](https://get.slack.help/hc/en-us/articles/215770388-Create-and-regenerate-API-tokens)