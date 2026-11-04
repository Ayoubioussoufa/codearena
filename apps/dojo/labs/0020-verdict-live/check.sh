#!/usr/bin/env bash
cd "$(dirname "$0")" || exit 1
for f in poll.mjs sse.mjs; do [ -f "$f" ] || { echo "No $f yet. Start with: cp ${f%.mjs}.start.mjs $f"; exit 1; }; done
node check.mjs "$@"
