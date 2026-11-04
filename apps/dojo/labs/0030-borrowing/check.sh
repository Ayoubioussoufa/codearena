#!/usr/bin/env bash
# Lesson 0030 checker: lesson 9's comparator in Rust, borrowing everything.
#
#   bash check.sh        compile, run the kit's tests, then count .clone() calls
cd "$(dirname "$0")" || exit 1
. ../_lib/check-lib.sh
. ../_lib/cargo-lib.sh

need_cargo
need_file src/lib.rs src/lib.start.rs
compile_or_explain

section "Comparing outputs without copying them"
run_cargo_tests

section "The rule of this lab"
clones=$(grep -v '^\s*//' src/lib.rs | grep -o '\.clone()' | wc -l)
if [ "$clones" -eq 0 ]; then
	pass "no .clone() anywhere" "everything is borrowed"
else
	fail "no .clone() anywhere" "found $clones. Each one copies data a borrow could lend."
fi
summary 0030
