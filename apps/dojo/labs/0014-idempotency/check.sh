#!/usr/bin/env bash
# Lesson 0014 checker: starts a throwaway Postgres, runs check.mjs, removes it.
cd "$(dirname "$0")" || exit 1
docker image inspect postgres:16-alpine >/dev/null 2>&1 || docker pull -q postgres:16-alpine >/dev/null || { echo "Docker is needed for this lab."; exit 1; }
name="lab14-pg-$$"
docker run -d --rm --name "$name" -e POSTGRES_USER=lab -e POSTGRES_PASSWORD=lab -e POSTGRES_DB=lab postgres:16-alpine >/dev/null || exit 1
trap 'docker rm -f "$name" >/dev/null 2>&1' EXIT
for _ in $(seq 1 100); do docker exec "$name" pg_isready -U lab -d lab >/dev/null 2>&1 && docker exec "$name" psql -U lab -d lab -c 'select 1' >/dev/null 2>&1 && break; sleep 0.2; done
PG_CONTAINER="$name" node check.mjs "$@"
