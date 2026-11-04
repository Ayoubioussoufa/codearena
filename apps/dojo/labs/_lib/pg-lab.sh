# Shared by the Postgres labs: starts a throwaway Postgres in Docker and
# exports PG_CONTAINER; it's removed when the checker exits. Source it:
#   . ../_lib/pg-lab.sh
# shellcheck shell=bash
docker image inspect postgres:16-alpine >/dev/null 2>&1 || docker pull -q postgres:16-alpine >/dev/null || { echo "Docker is needed for this lab."; exit 1; }
PG_CONTAINER="lab-pg-$$"
docker run -d --rm --name "$PG_CONTAINER" -e POSTGRES_USER=lab -e POSTGRES_PASSWORD=lab -e POSTGRES_DB=lab postgres:16-alpine >/dev/null || exit 1
trap 'docker rm -f "$PG_CONTAINER" >/dev/null 2>&1' EXIT
for _ in $(seq 1 150); do docker exec "$PG_CONTAINER" psql -U lab -d lab -c 'select 1' >/dev/null 2>&1 && break; sleep 0.2; done
export PG_CONTAINER
