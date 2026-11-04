#!/usr/bin/env bash
# A Postgres for experiments. Run it in two terminals: each gets its own session.
#   bash shell.sh          start the container (first time) and open psql
#   bash shell.sh stop     remove the container
name=lab17-shell
if [ "${1:-}" = stop ]; then docker rm -f "$name" >/dev/null 2>&1; echo "removed"; exit 0; fi
if ! docker ps --format '{{.Names}}' | grep -qx "$name"; then
  docker run -d --rm --name "$name" -e POSTGRES_USER=lab -e POSTGRES_PASSWORD=lab -e POSTGRES_DB=lab postgres:16-alpine >/dev/null || exit 1
  for _ in $(seq 1 150); do docker exec "$name" psql -U lab -d lab -c 'select 1' >/dev/null 2>&1 && break; sleep 0.2; done
  docker cp "$(dirname "$0")/schema.sql" "$name:/schema.sql" >/dev/null
  docker exec "$name" psql -U lab -d lab -q -f /schema.sql 2>/dev/null
  echo "Started $name with the lab's tables. In a second terminal, run: bash shell.sh"
  echo "To reset the tables at any time, type in psql: \\i /schema.sql"
fi
exec docker exec -it "$name" psql -U lab -d lab
