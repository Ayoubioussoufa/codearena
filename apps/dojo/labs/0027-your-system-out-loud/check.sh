#!/usr/bin/env bash
cd "$(dirname "$0")" || exit 1
[ -f outline.md ] || { echo "No outline.md yet: see README.md."; exit 1; }
node check.mjs "$@"
