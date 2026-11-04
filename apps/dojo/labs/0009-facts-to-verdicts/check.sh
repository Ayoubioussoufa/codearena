#!/usr/bin/env bash
# Lesson 0009 checker: runs check.mjs against your judge.mjs.
cd "$(dirname "$0")" || exit 1
exec node check.mjs "$@"
