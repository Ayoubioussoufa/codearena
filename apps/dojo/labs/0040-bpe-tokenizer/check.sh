#!/usr/bin/env bash
# Lesson 0040 checker: byte-level BPE, trained and replayed.
#
#   bash check.sh        compile, then run the kit's tests
cd "$(dirname "$0")" || exit 1
. ../_lib/check-lib.sh
. ../_lib/cargo-lib.sh

need_cargo
need_file src/lib.rs src/lib.start.rs
compile_or_explain

section "A BPE tokenizer"
run_cargo_tests

summary 0040
