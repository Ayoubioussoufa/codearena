#!/usr/bin/env bash
# Lesson 0004 checker: runs check.mjs against your runner.mjs.
cd "$(dirname "$0")" || exit 1
exec node check.mjs "$@"
