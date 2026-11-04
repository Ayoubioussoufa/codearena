#!/usr/bin/env bash
# Lesson 0039 checker: async jobs with a limit, timeouts, select! and spawn_blocking.
#
#   bash check.sh        compile, then run the kit's tests
cd "$(dirname "$0")" || exit 1
. ../_lib/check-lib.sh
. ../_lib/cargo-lib.sh

need_cargo
need_file src/lib.rs src/lib.start.rs
compile_or_explain

section "Async"
run_cargo_tests

summary 0039
