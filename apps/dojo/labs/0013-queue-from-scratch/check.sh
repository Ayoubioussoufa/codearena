#!/usr/bin/env bash
# Lesson 0013 checker: starts a throwaway Redis in Docker, runs check.mjs, removes it.
cd "$(dirname "$0")" || exit 1
. ../_lib/redis-lab.sh
node check.mjs "$@"
