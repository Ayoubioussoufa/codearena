#!/usr/bin/env bash
# Lesson 0038 checker: parallel judging, with no data races.
#
#   bash check.sh        compile, then run the kit's tests
cd "$(dirname "$0")" || exit 1
. ../_lib/check-lib.sh
. ../_lib/cargo-lib.sh

need_cargo
need_file src/lib.rs src/lib.start.rs
compile_or_explain

section "Threads"
run_cargo_tests

summary 0038
