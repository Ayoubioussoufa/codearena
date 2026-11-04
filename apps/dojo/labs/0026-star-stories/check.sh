#!/usr/bin/env bash
cd "$(dirname "$0")" || exit 1
[ -f stories.md ] || { echo "No stories.md yet. Start with: cp stories.start.md stories.md"; exit 1; }
node check.mjs "$@"
