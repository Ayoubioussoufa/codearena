# Lab 0022: the production Compose file

`docker-compose.dev.yml` is CodeArena's development file: fine on a laptop,
dangerous on a server. Write **`docker-compose.prod.yml`**, the file the VM will
run, and **`.env.prod.example`**, which lists every variable it needs, without
values. (`.env.prod`, the real one, never goes in git.)

Seven services: `proxy` (Caddy, the only thing the internet can reach), `web`,
`api`, `worker`, `migrate` (a one-shot job: `npx prisma migrate deploy`, then it
exits), `postgres`, `redis`. App images come from your registry:
`ghcr.io/<you>/codearena-{web,api,worker}:<tag>`; `migrate` reuses the api image.

`bash check.sh` runs `docker compose config` on your file (the real parser and
validator) and checks the rules below. The lesson explains each one.

1. It's valid Compose, and every service is there.
2. Images: pinned versions, never `latest`, never `build:`; app images use `${TAG}`.
3. Required variables fail loudly when missing (`${TAG:?message}`).
4. No secret written in the file: passwords, secrets and URLs holding them come from variables.
5. Only `proxy` publishes ports, and only 80 and 443.
6. Only `worker` gets the Docker socket.
7. `postgres` and `redis` share no network with `proxy`.
8. Long-running services restart; `migrate` doesn't.
9. `postgres`, `redis` and `api` have health checks.
10. Start order: `api` and `worker` wait for healthy `postgres` and `redis`, and for `migrate` to finish successfully.
11. Postgres's data lives in a named volume.
12. Every service rotates its logs (`max-size`).
13. `worker` has a memory limit.
14. `.env.prod.example` lists every variable the file uses.
