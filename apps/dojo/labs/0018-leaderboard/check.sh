#!/usr/bin/env bash
cd "$(dirname "$0")" || exit 1
[ -f leaderboard.mjs ] || { echo "No leaderboard.mjs yet. Start with: cp leaderboard.start.mjs leaderboard.mjs"; exit 1; }
. ../_lib/redis-lab.sh
node check.mjs "$@"
