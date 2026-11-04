#!/usr/bin/env bash
cd "$(dirname "$0")" || exit 1
[ -f observe.mjs ] || { echo "No observe.mjs yet. Start with: cp observe.start.mjs observe.mjs"; exit 1; }
node check-observe.mjs || status=1
if [ -f backup.sh ] && [ -f restore-check.sh ]; then
  . ../_lib/pg-lab.sh
  node check-backup.mjs || status=1
else
  echo; echo "Part 2: no backup.sh and restore-check.sh yet: see README.md."; status=1
fi
exit "${status:-0}"
