# Directory for third party stuff

This directory is for configuration files, data, documentation, etc,
related to third party tools useful (or in some cases, needed)
by GrimoireLab or some of the GrimoireLab tools.

## Docker image cross-nlp-rest-api

This is image is used to add sentiment and emotion data to GrimoireLab data. The image can be created
using the following steps:
```bash
$ sudo apt-get install maven (if you don't have Maven in your machine)
$ git clone https://github.com/CROSS-NLP/CROSS-NLP-REST-API.git
$ cd CROSS-NLP-REST-API/cross-nlp-rest-api
$ mvn -N io.takari:maven:wrapper
$ ./mvnw install
$ cd ..
$ docker build -t cross-nlp-rest-api .
``` 

Once done, you can run the container with the command below:
```bash
$ docker run -p <Port>:8080 -t cross-nlp-rest-api --name cross-nlp-rest-api
```

Then, you can and add sentiment and emotion information to your Github data by adding the study `enrich_feelings` to your setup.cfg:

```buildoutcfg
[github2:issue]
api-token = ...
raw_index = github2-issue_chaoss
enriched_index = github2-issue_chaoss_enriched
sleep-for-rate = true
no-archive = true
studies = [enrich_feelings]

[enrich_feelings]
attributes = [body]
nlp_rest_url = http://localhost:<Port>
``` 

## Docker image grimoirelab/full-3p

This is a descendant image from grimoirelab/full, with third party tools in it (e.g., nomos, cloc).

```
docker build -f Dockerfile-grimoirelab-3p -t grimoirelab/full-3p .
```

## Example
This section shows an example to use the third party image. It includes the steps to create the image, the projects.json, credentials.cfg,
dashboard.cfg files and the docker command to run the image.

### Preparation
Clone the repo, create the image and set the working directory
```
git clone https://github.com/chaoss/grimoirelab && cd grimoirelab/third-party
docker build -f Dockerfile-grimoirelab-3p -t grimoirelab/full-3p .
cd ../default-grimoirelab-settings
```

Copy/replace the following files in the current directory (`default-grimoirelab-settings`)

- **projects.json**
    ```
    {
        "grimoirelab": {
          "meta": {
            "title": "GrimoireLab"
          },
          "git": [
              "https://github.com/chaoss/grimoirelab-toolkit"
            ],
          "cocom": [
             "https://github.com/chaoss/grimoirelab-toolkit"
           ],
          "colic": [
             "https://github.com/chaoss/grimoirelab-toolkit"
           ],
          "github": [
             "https://github.com/chaoss/grimoirelab-toolkit"
           ]
        }
    }
    ```

- **credentials.cfg**
    ```
    [github]
    api-token = <YOUR-API-TOKEN>
    ```

- **dashboard.cfg**
    ```
    [general]
    # Update incrementally, forever
    update = true
    # Don't start a new update earlier than (since last update, seconds)
    min_update_delay = 300
    # Produce debugging data for the logs
    debug = true
    
    [es_enrichment]
    # Refresh identities and projects for all items after enrichment
    autorefresh = true
    
    [sortinghat]
    # Run affilation
    affiliate = True
    # How to match to unify
    matching = [email]
    # How long to sleep before running again, for identities tasks
    sleep_for = 100
    
    [panels]
    # Dashboard: default time frame
    kibiter_time_from = "now-1y"
    # Dashboard: default index pattern
    kibiter_default_index = "git"
    # GitHub repos panels
    code-complexity = true
    code-license = true
    
    [phases]
    collection = true
    identities = true
    enrichment = true
    panels = true
    
    [git]
    # Names for raw and enriched indexes
    raw_index = git_grimoirelab-raw
    enriched_index = git_grimoirelab
    studies = [enrich_demography:git, enrich_areas_of_code:git, enrich_onion:git]
    
    [github]
    # Names for raw and enriched indexes
    raw_index = github_grimoirelab-raw
    enriched_index = github_grimoirelab
    # Sleep it GitHub API rate is exhausted, waited until it is recovered
    sleep-for-rate = true
    
    [cocom]
    raw_index = cocom_chaoss
    enriched_index = cocom_chaoss_enrich
    category = code_complexity_lizard_file
    studies = [enrich_cocom_analysis]
    branches = master
    worktree-path = /tmp/cocom/
    
    [enrich_cocom_analysis]
    out_index = cocom_chaoss_study
    interval_months = [3]
    
    [colic]
    raw_index = colic_chaoss
    enriched_index = colic_chaoss_enrich
    category = code_license_nomos
    studies = [enrich_colic_analysis]
    exec-path = /usr/share/fossology/nomos/agent/nomossa
    branches = master
    worktree-path = /tmp/colic
    
    [enrich_colic_analysis]
    out_index = colic_chaoss_study
    interval_months = [6]
    
    [enrich_demography:git]
    
    [enrich_areas_of_code:git]
    in_index = git_grimoirelab-raw
    out_index = git_aoc_grimoirelab-enriched
    
    [enrich_onion:git]
    in_index = git_grimoirelab
    out_index = git_onion_grimoirelab-enriched
    ```

### Execution

Execute the following docker run command (in the current directory (`default-grimoirelab-settings`) to run the image with the previous files
```
docker run -p 5601:5601 -p 9000:9200 -v $(pwd)/projects.json:/projects.json -v $(pwd)/dashboard.cfg:/dashboard.cfg -v $(pwd)/credentials.cfg:/override.cfg -t grimoirelab/full-3p
```

### Visualization

You can access the data via ElasticSearch or Kibiter.

- **ElasticSearch**
    - List indices info: http://localhost:9000/_cat/indices?pretty
    - List indices and their aliases: http://localhost:9000/_alias?pretty
    - List the mappings of an index: http://localhost:9000/your-index?pretty
    - List some items in an index: http://localhost:9000/your-index/_search?pretty

- **Kibiter**
    - Explore the dashboards: http://localhost:5601

Note that you can execute the ElasticSearch commands directly in Kibana via the `Dev tools` (wrench icon on the left side)
