#!/usr/bin/env bash
# Lesson 0007 checker: your guard.c, root without its powers, and a syscall filter.
cd "$(dirname "$0")" || exit 1
. ../_lib/check-lib.sh

build_progs
build_learner guard.c guard
[ "${1:-}" = build ] && exit 0
cleanup() { :; }

# expect <expected stdout, exactly> <guard args...>
expect() {
	local expected="$1" label out
	shift
	label="$(show guard "$@")"
	timeout -s KILL 5 ./build/guard "$@" >"$OUT_FILE" 2>/dev/null </dev/null
	out="$(cat "$OUT_FILE")"
	if [ "$out" = "$expected" ]; then pass "$label" "${out//$'\n'/ ⏎ }"
	else fail "$label" "expected '${expected//$'\n'/ ⏎ }', got '${out//$'\n'/ ⏎ }'"; fi
}

# expect_not <stdout it must NOT be> <guard args...>
expect_not() {
	local unwanted="$1" label out
	shift
	label="$(show guard "$@")"
	timeout -s KILL 5 ./build/guard "$@" >"$OUT_FILE" 2>/dev/null </dev/null
	out="$(cat "$OUT_FILE")"
	if [ -n "$out" ] && [ "$out" != "$unwanted" ]; then pass "$label" "${out//$'\n'/ ⏎ }"
	else fail "$label" "got '${out//$'\n'/ ⏎ }'"; fi
}

ZERO=0000000000000000

section "Root inside, with no powers"
expect $'0\nexit 0' id -u
expect $'CapEff:\t'"$ZERO"$'\nexit 0' grep CapEff /proc/self/status
expect $'CapBnd:\t'"$ZERO"$'\nexit 0' grep CapBnd /proc/self/status
expect_not $'CapEff:\t'"$ZERO"$'\nexit 0' -k grep CapEff /proc/self/status
expect 'exit 1' unshare -m true
expect 'exit 0' -k unshare -m true

section "No new privileges"
expect $'NoNewPrivs:\t1\nexit 0' -n grep NoNewPrivs /proc/self/status
expect $'NoNewPrivs:\t0\nexit 0' grep NoNewPrivs /proc/self/status

section "The system-call filter"
expect $'Seccomp:\t2\nexit 0' -s grep Seccomp: /proc/self/status
expect $'socket ok\nexit 0' python3 -c 'import socket; socket.socket(); print("socket ok")'
expect 'exit 1' -s python3 -c 'import socket; socket.socket(); print("socket ok")'
expect 'signal 31' -s unshare -m true
expect $'still fine\nexit 0' -s sh -c 'echo still fine'

section "Called wrong"
code=0; ./build/guard >/dev/null 2>&1 || code=$?
if [ "$code" = 2 ]; then pass "guard   (no program)" "usage, exit 2"; else fail "guard   (no program)" "expected exit 2, got $code"; fi

summary 0007
