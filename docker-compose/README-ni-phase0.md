# NI OSS Health Dashboard - Phase 0 Run Guide

Stand up the GrimoireLab pipeline locally against a **Tier-1 subset** of the NI org
(top 10 public repos by stars). Goal: prove collection -> enrichment -> OpenSearch
end to end before scaling to all ~219 public repos.

This runs inside the GrimoireLab **fork** (the tool). The companion context repo
(`oss-health-dashboard`) only holds knowledge/docs and does not run anything.

## Prerequisites

- Docker + Docker Compose.
- A GitHub token (the repo owner already has one via `gh`). Scopes needed: `repo`
  (public), `read:org`. Classic or fine-grained both work for public read.
- Python 3.10+ (only to (re)generate config; not needed to run the containers).

## What each file is

| File | Committed? | Purpose |
|------|-----------|---------|
| `default-grimoirelab-settings/projects.json` | yes | Repo list GrimoireLab collects (generated). |
| `default-grimoirelab-settings/setup-ni.cfg.template` | yes | SirMordred config with a `__GITHUB_TOKEN__` placeholder. |
| `default-grimoirelab-settings/setup-ni.cfg` | **no (git-ignored)** | Runtime config with the real token. Mounted into mordred. |
| `scripts/gen_projects.py` | yes | Regenerates `projects.json` from the live org. |
| `scripts/render_setup.py` | yes | Injects the token into the runtime config. |

## Steps

Run from the fork root.

### 1. (Optional) Regenerate the repo list

Already committed, but to refresh from the live org:

```bash
GITHUB_TOKEN=$(gh auth token) \
  python scripts/gen_projects.py --org ni --tier 1 --top 10 \
    --output default-grimoirelab-settings/projects.json
```

### 2. Render the runtime config (injects your token)

```bash
GITHUB_TOKEN=$(gh auth token) \
  python scripts/render_setup.py \
    default-grimoirelab-settings/setup-ni.cfg.template \
    default-grimoirelab-settings/setup-ni.cfg
```

The token is written only into the git-ignored `setup-ni.cfg`. Confirm it will not be
committed:

```bash
git check-ignore default-grimoirelab-settings/setup-ni.cfg   # prints the path => ignored
```

### 3. Bring up the stack

```bash
cd docker-compose
docker compose up -d
```

Services: `mariadb`, `valkey`, `opensearch` (9200), `opensearch-dashboards` (5601),
`sortinghat`, `nginx` (8000), and `mordred` (the orchestrator).

### 4. Watch the pipeline

```bash
docker compose logs -f mordred
```

Collection (git is fast; github is rate-limited) then enrichment. First backfill of
10 repos typically takes a few to several minutes. Expect periodic github pauses:
`sleep-for-rate` waits out the GitHub API budget rather than failing.

### 5. Verify data landed in OpenSearch

```bash
curl -sk -u admin:GrimoireLab.1 'https://localhost:9200/_cat/indices?v' | grep _ni_
```

You should see (row counts grow as enrichment runs):

- `git_ni_raw`, `git_ni_enriched`
- `github_ni_raw`, `github_ni_enriched`
- `git-aoc_ni_enriched`, `git-onion_ni_enriched` (study outputs)

### 6. Explore

Open OpenSearch Dashboards at http://localhost:5601 and create index patterns for
`git_ni_enriched` and `github_ni_enriched`. Panels are Phase 1; Phase 0 only proves
the data pipeline.

## Notes / gotchas

- **`panels = false`** in the config on purpose. Sigils panel import is Phase 1.
- **Identity resolution is provisional.** SortingHat merges identities, but org
  affiliation and bus-factor/diversity metrics are only trustworthy after the Phase 2
  identity pass (see `docs/metrics.md`, principle P4 in the companion repo).
- **Rate limits.** Tier 1 (10 repos) stays well under 5000 req/hr. Scaling to all 219
  repos needs the tiering in `gen_projects.py` (`--tier 1,2` + git-only Tier 3) and
  incremental runs; that is a later phase.
- **Reset.** `docker compose down -v` drops volumes (OpenSearch + MariaDB data) for a
  clean re-run.

## Teardown

```bash
cd docker-compose
docker compose down        # stop, keep data
docker compose down -v     # stop and wipe indices/identities
```
