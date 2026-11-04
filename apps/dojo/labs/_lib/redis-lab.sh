# Shared by the Redis labs: starts a throwaway Redis in Docker on a random local
# port and exports REDIS_PORT; it's removed when the checker exits. Source it:
#   . ../_lib/redis-lab.sh
# shellcheck shell=bash
docker image inspect redis:7-alpine >/dev/null 2>&1 || docker pull -q redis:7-alpine >/dev/null || { echo "Docker is needed for this lab."; exit 1; }
REDIS_CONTAINER="lab-redis-$$"
docker run -d --rm --name "$REDIS_CONTAINER" -p 127.0.0.1::6379 redis:7-alpine >/dev/null || exit 1
trap 'docker rm -f "$REDIS_CONTAINER" >/dev/null 2>&1' EXIT
REDIS_PORT="$(docker port "$REDIS_CONTAINER" 6379 | head -1 | sed 's/.*://')"
for _ in $(seq 1 50); do docker exec "$REDIS_CONTAINER" redis-cli ping >/dev/null 2>&1 && break; sleep 0.1; done
export REDIS_PORT REDIS_CONTAINER
