#!/bin/bash

echo "Doing the GrimoireLab release ..."

# You need to configure a GitHub API token
GITHUB_API_TOKEN=''

if [[ -z $GITHUB_API_TOKEN ]]; then
  echo "GitHub API token not configured"
  exit 1
fi

# Collect last commit versions
echo "Collecting last commit versions for GrimoireLab repositories for the release"
cp requirements.cfg requirements.cfg.old
./last_commits.py -t $GITHUB_API_TOKEN > requirements.cfg

if [[ $? -ne 0 ]]; then
  echo "Problem collecting GrimoireLab repositories versions"
  exit 1
fi

# Create the logs dir if it does not exists and clean it
mkdir -p logs
rm logs/*
# First stop mordred containers for doing the release testing
docker-compose stop mordred
# Remove mordred container
docker-compose rm -f mordred
# Remove additional containers but with confirmation
# docker-compose  rm
# Start the mordred container to do the full testing
echo "Executing mordred container ..."
docker-compose up mordred
echo "Checking for errors mordred execution ..."
grep -i error logs/all.log
echo "Checking panels ..."
./check_panels.py 2>/dev/null| grep -B2 "RESULT:  KO" | grep Checking | awk '{print $2}' | sort
