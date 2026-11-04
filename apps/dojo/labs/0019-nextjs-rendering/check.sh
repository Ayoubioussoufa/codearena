#!/usr/bin/env bash
cd "$(dirname "$0")" || exit 1
[ -f render.mjs ] || { echo "No render.mjs yet. Start with: cp render.start.mjs render.mjs"; exit 1; }
node check.mjs "$@"
