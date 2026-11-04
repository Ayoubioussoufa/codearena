#!/usr/bin/env bash
# Lesson 0029 checker: five ownership fixes, then split_words.
#
#   bash check.sh        compile, run the kit's tests, then count .clone() calls
cd "$(dirname "$0")" || exit 1
. ../_lib/check-lib.sh
. ../_lib/cargo-lib.sh

need_cargo
need_file src/lib.rs src/lib.start.rs
compile_or_explain

section "Ownership, then split_words"
run_cargo_tests

section "The rule of this lab"
clones=$(grep -v '^\s*//' src/lib.rs | grep -o '\.clone()' | wc -l)
if [ "$clones" -eq 0 ]; then
	pass "no .clone() anywhere" "every fix changed who owns what"
else
	fail "no .clone() anywhere" "found $clones: each one copies data to dodge a move. Borrow instead."
fi
summary 0029
