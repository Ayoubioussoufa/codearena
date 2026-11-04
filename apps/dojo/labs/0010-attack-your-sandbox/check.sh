#!/usr/bin/env bash
# Lesson 0010 checker: your attacks, against your runner and against six weakened ones.
cd "$(dirname "$0")" || exit 1
docker image inspect python:3.12-alpine >/dev/null 2>&1 || docker pull -q python:3.12-alpine >/dev/null || { echo "Docker is needed for this lab."; exit 1; }
exec node check.mjs "$@"
