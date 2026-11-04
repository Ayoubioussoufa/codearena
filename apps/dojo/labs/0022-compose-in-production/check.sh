#!/usr/bin/env bash
cd "$(dirname "$0")" || exit 1
[ -f docker-compose.prod.yml ] || { echo "No docker-compose.prod.yml yet: see README.md."; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "This lab needs the docker compose plugin."; exit 1; }
node check.mjs "$@"
