#!/usr/bin/env bash
# Lesson 0037 checker: minijudge, run against lesson 37's C programs.
#
#   bash check.sh        build the test programs, compile, run the kit's tests
cd "$(dirname "$0")" || exit 1
. ../_lib/check-lib.sh
. ../_lib/cargo-lib.sh

need_cargo
need_file src/main.rs src/main.start.rs
build_progs
compile_or_explain

section "A judge in one binary"
run_cargo_tests
summary 0037
