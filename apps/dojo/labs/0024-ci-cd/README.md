# Lab 0024: merge to main, and it's live (or it rolls back)

Two files. Together they are CodeArena's whole delivery pipeline.

## 1. `deploy.sh`: runs on the server

    deploy.sh <tag>

It lives in `/srv/codearena` on the VM, next to `docker-compose.prod.yml` and
`.env.prod`, and a file `current-tag` that holds the tag now running. It must:

0. work from any directory (ssh runs it from deploy's home): start by `cd`-ing to its own folder;
1. refuse a tag that isn't 7 to 40 lowercase hex characters (a git SHA), before doing anything;
2. pull the new images: `TAG=<tag> docker compose -f docker-compose.prod.yml pull`;
3. start them and wait for health checks: `TAG=<tag> docker compose -f docker-compose.prod.yml up -d --wait`;
4. check the site answers: `curl -fsS --retry 5 --retry-delay 2 http://localhost/health`;
5. on success, write `<tag>` to `current-tag`, and exit 0;
6. if step 3 or 4 fails: **roll back** (`up -d --wait` again with the tag from `current-tag`),
   leave `current-tag` unchanged, and exit non-zero. With no `current-tag` (the first
   deploy), there's nothing to roll back to: just exit non-zero.
   If the pull fails, nothing has changed yet: exit non-zero without touching anything.

The checker runs it with fake `docker` and `curl` commands that record every call
and fail on demand, so you can test a rollback without a server.

## 2. `deploy.yml`: the GitHub Actions workflow

On every push to `main`, or by hand with an optional `tag` input (that's your
rollback button):

- **test**: install and run the tests;
- **build** (needs test): build and push `ghcr.io/<owner>/codearena-{api,web,worker}`, tagged with the commit SHA;
- **deploy** (needs build), in the `production` environment: SSH to the server and run
  `deploy.sh` with `inputs.tag` if given, else the commit SHA.

The checker runs **actionlint** (which also runs shellcheck on your `run:` scripts),
then these rules, explained in the lesson:

- triggers: push to `main`, and `workflow_dispatch` with a `tag` input; never `pull_request`;
- `permissions` at the top: `contents: read`, and `packages: write` only where images are pushed;
- `concurrency` so two deploys never overlap, without cancelling one halfway;
- every `uses:` pinned to a full 40-character commit SHA;
- no `${{ github.event... }}` and no `${{ inputs... }}` written straight into a `run:` script;
- the SSH key and the server's host key come from secrets; `StrictHostKeyChecking=no` never appears.
