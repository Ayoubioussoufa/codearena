#!/usr/bin/env bash
# Lesson 0021 checker: provisions a fresh "VM" with your setup.sh, then attacks it from "the internet".
cd "$(dirname "$0")" || exit 1
for f in setup.sh 50-hardening.conf keys/deploy keys/deploy.pub; do [ -f "$f" ] || { echo "No $f yet: see README.md."; exit 1; }; done
IMAGE="dojo-lab-server:$(sha256sum Dockerfile | cut -c1-12)"
docker image inspect "$IMAGE" >/dev/null 2>&1 || { echo "Building the VM image (once)…"; docker build -q -t "$IMAGE" . >/dev/null || exit 1; }
NET="lab21-net-$$"; VM="lab21-vm-$$"; NET_CREATED=
cleanup() { docker rm -f "$VM" >/dev/null 2>&1; [ -n "$NET_CREATED" ] && docker network rm "$NET" >/dev/null 2>&1; }
trap cleanup EXIT
docker network create "$NET" >/dev/null && NET_CREATED=1
# The fresh VM: the provider put your key in root's account, an old "ops" account exists,
# and two services listen on every interface.
docker run -d --name "$VM" --hostname codearena-vm --network "$NET" --cap-add NET_ADMIN --cap-add NET_RAW \
  -v "$PWD:/lab:ro" "$IMAGE" sh -c '
    set -e
    mkdir -p /root/.ssh && cp /lab/keys/deploy.pub /root/.ssh/authorized_keys && chmod 700 /root/.ssh && chmod 600 /root/.ssh/authorized_keys
    usermod -p "*" root
    adduser -D -s /bin/sh ops && usermod -p "*" ops && mkdir -p /home/ops/.ssh && cp /lab/keys/deploy.pub /home/ops/.ssh/authorized_keys
    chown -R ops:ops /home/ops/.ssh && chmod 700 /home/ops/.ssh && chmod 600 /home/ops/.ssh/authorized_keys
    ssh-keygen -A >/dev/null
    for p in 80 5432 6379; do (while true; do echo hello | nc -l -p $p >/dev/null 2>&1; done) & done
    if sh -e /lab/setup.sh > /tmp/setup.log 2>&1; then echo ok > /tmp/setup.status; else echo failed > /tmp/setup.status; fi
    exec /usr/sbin/sshd -D -e 2>/tmp/sshd.log' >/dev/null || exit 1
for _ in $(seq 1 100); do docker exec "$VM" test -f /tmp/setup.status 2>/dev/null && break; sleep 0.2; done
sleep 0.5
VM="$VM" NET="$NET" IMAGE="$IMAGE" node check.mjs "$@"
