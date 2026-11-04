#!/usr/bin/env bash
# Lesson 0028 checker: lesson 1's wait-status decoder, in Rust.
#
#   bash check.sh        compile, then run the kit's tests in tests/
cd "$(dirname "$0")" || exit 1
. ../_lib/check-lib.sh
. ../_lib/cargo-lib.sh

need_cargo
need_file src/lib.rs src/lib.start.rs
compile_or_explain

section "Decoding a wait status"
run_cargo_tests
summary 0028
