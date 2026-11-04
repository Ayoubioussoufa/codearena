#!/usr/bin/env bash
cd "$(dirname "$0")" || exit 1
for f in deploy.sh deploy.yml; do [ -f "$f" ] || { echo "No $f yet: see README.md."; exit 1; }; done
python3 -c "import yaml" 2>/dev/null || { echo "This lab needs python3 with PyYAML (pip install pyyaml)."; exit 1; }
node check.mjs "$@"
