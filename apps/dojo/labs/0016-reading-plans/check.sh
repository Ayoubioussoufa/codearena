#!/usr/bin/env bash
cd "$(dirname "$0")" || exit 1
for f in page.sql solved.sql list.sql; do [ -f "$f" ] || { echo "No $f yet: see README.md."; exit 1; }; done
. ../_lib/pg-lab.sh
node check.mjs "$@"
