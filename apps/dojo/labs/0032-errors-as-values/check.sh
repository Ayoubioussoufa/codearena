#!/usr/bin/env bash
# Lesson 0032 checker: a limits file, parsed with Result and ?.
#
#   bash check.sh        compile, run the kit's tests, then look for unwrap()
cd "$(dirname "$0")" || exit 1
. ../_lib/check-lib.sh
. ../_lib/cargo-lib.sh

need_cargo
need_file src/lib.rs src/lib.start.rs
compile_or_explain

section "Parsing, with errors as values"
run_cargo_tests

section "The rule of this lab"
code=$(grep -v '^\s*//' src/lib.rs)
n=$(printf '%s\n' "$code" | grep -oE '\.(unwrap|expect)\(|panic!\(' | wc -l)
if [ "$n" -eq 0 ]; then
	pass "no unwrap(), expect() or panic!" "every failure is a value"
else
	fail "no unwrap(), expect() or panic!" "found $n. Each one turns a value the caller could handle into a crash."
fi
summary 0032
