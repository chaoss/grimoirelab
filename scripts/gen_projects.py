#!/usr/bin/env python3
"""Generate a GrimoireLab projects.json from a GitHub organization's public repos.

Part of the NI OSS Health Dashboard (see the companion context repo
https://github.com/MIpetrov-NI/oss-health-dashboard). This produces the repo list
GrimoireLab collects; it is a *generated artifact* — change this script, not the JSON.

Tiering (to manage GitHub rate limits at ~278 repos):
  Tier 1  flagship  — top repos by stars; full git + github collection.
  Tier 2  active    — pushed within --active-days; git + github.
  Tier 3  archival  — everything else; git only.

Usage:
  GITHUB_TOKEN=$(gh auth token) python scripts/gen_projects.py --org ni --tier 1 \
      --top 10 --output default-grimoirelab-settings/projects.json

Auth: reads GITHUB_TOKEN or GH_TOKEN from the environment (optional but recommended;
raises the API rate limit). Public listing works unauthenticated for small orgs.
"""
import argparse
import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone

API = "https://api.github.com"


def _get(url):
    req = urllib.request.Request(url, headers={
        "Accept": "application/vnd.github+json",
        "User-Agent": "oss-health-dashboard-gen-projects",
    })
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as resp:
            return json.load(resp), resp.headers
    except urllib.error.HTTPError as e:
        sys.exit(f"GitHub API error {e.code} for {url}: {e.read().decode()[:200]}")


def list_public_repos(org, include_forks, include_archived):
    repos, page = [], 1
    while True:
        data, _ = _get(f"{API}/orgs/{org}/repos?type=public&per_page=100&page={page}")
        if not data:
            break
        for r in data:
            if r.get("private"):
                continue
            if r.get("fork") and not include_forks:
                continue
            if r.get("archived") and not include_archived:
                continue
            repos.append(r)
        page += 1
    return repos


def days_since(iso):
    if not iso:
        return 10**9
    dt = datetime.strptime(iso, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    return (datetime.now(timezone.utc) - dt).days


def assign_tier(repo, rank, top, active_days):
    """rank: 0-based index by stars desc."""
    if rank < top:
        return 1
    if days_since(repo.get("pushed_at")) <= active_days:
        return 2
    return 3


def build_projects(repos, tiers_wanted, top, active_days, title):
    ranked = sorted(repos, key=lambda r: r.get("stargazers_count", 0), reverse=True)
    git_urls, github_urls = [], []
    kept = []
    for i, r in enumerate(ranked):
        tier = assign_tier(r, i, top, active_days)
        if tier not in tiers_wanted:
            continue
        kept.append((r["full_name"], tier, r.get("stargazers_count", 0)))
        git_urls.append(r["clone_url"])          # https://github.com/ni/<repo>.git
        if tier in (1, 2):                        # github backend only for tier 1/2
            github_urls.append(r["html_url"])    # https://github.com/ni/<repo>
    key = title.lower().replace(" ", "-")
    project = {key: {"meta": {"title": title, "tiers": sorted(tiers_wanted)}, "git": git_urls}}
    if github_urls:
        project[key]["github"] = github_urls
    return project, kept


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--org", default="ni")
    ap.add_argument("--tier", default="1", help="Comma list or 'all' (e.g. '1', '1,2', 'all').")
    ap.add_argument("--top", type=int, default=10, help="How many top-starred repos are Tier 1.")
    ap.add_argument("--active-days", type=int, default=365, help="Pushed within N days => Tier 2.")
    ap.add_argument("--include-forks", action="store_true")
    ap.add_argument("--include-archived", action="store_true")
    ap.add_argument("--title", default="NI OSS Ecosystem")
    ap.add_argument("--output", default="-", help="File path or '-' for stdout.")
    args = ap.parse_args()

    tiers_wanted = {1, 2, 3} if args.tier == "all" else {int(t) for t in args.tier.split(",")}

    repos = list_public_repos(args.org, args.include_forks, args.include_archived)
    projects, kept = build_projects(repos, tiers_wanted, args.top, args.active_days, args.title)

    out = json.dumps(projects, indent=2, sort_keys=False) + "\n"
    if args.output == "-":
        sys.stdout.write(out)
    else:
        with open(args.output, "w", encoding="utf-8", newline="\n") as f:
            f.write(out)
    # Summary to stderr so stdout stays clean JSON.
    print(f"[gen_projects] org={args.org} public_repos={len(repos)} "
          f"selected={len(kept)} tiers={sorted(tiers_wanted)}", file=sys.stderr)
    for name, tier, stars in kept[:40]:
        print(f"  T{tier} {stars:>5}*  {name}", file=sys.stderr)


if __name__ == "__main__":
    main()
