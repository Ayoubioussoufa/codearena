#!/usr/bin/env bash
cd "$(dirname "$0")" || exit 1
[ -f indexes.sql ] || { echo "No indexes.sql yet: see README.md."; exit 1; }
. ../_lib/pg-lab.sh
node check.mjs "$@"
