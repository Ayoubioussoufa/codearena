# Shared helpers for lab checkers (lab 0002 onwards). Source it from a lab:
#   cd "$(dirname "$0")" || exit 1
#   . ../_lib/check-lib.sh
# shellcheck shell=bash

set -u

green=$'\e[32m'; red=$'\e[31m'; yellow=$'\e[33m'; dim=$'\e[2m'; bold=$'\e[1m'; off=$'\e[0m'
[ -t 1 ] || { green=; red=; yellow=; dim=; bold=; off=; }

PASS=0
FAIL=0

# The command as you'd type it, quotes included: show ./build/run -t 500 sh -c 'exit 5'
show() {
	local out="" a
	for a in "$@"; do
		case "$a" in
		*"'"*) out+=" \"$a\"" ;;
		*' '* | *'$'*) out+=" '$a'" ;;
		*) out+=" $a" ;;
		esac
	done
	printf '%s' "${out# }"
}

section() { printf '\n%s%s%s\n' "$bold" "$1" "$off"; }
pass() { printf '  %s✓%s %-48s %s\n' "$green" "$off" "$1" "${2:-}"; PASS=$((PASS + 1)); }
fail() { printf '  %s✗%s %-48s %s\n' "$red" "$off" "$1" "${2:-}"; FAIL=$((FAIL + 1)); }
note() { printf '  %s•%s %-48s %s\n' "$yellow" "$off" "$1" "${2:-}"; }

# Milliseconds on a clock that never jumps. `date` reads the wall clock, which
# can be corrected backwards mid-run (WSL does it): lesson 2's trap, avoided.
now_ms() { awk '{ printf "%d", $1 * 1000 }' /proc/uptime; }

# A scratch file for one case's output. Output goes to a file, not a pipe:
# an orphan left holding a pipe open would make the checker wait for it.
OUT_FILE="$(mktemp)"
trap 'rm -f "$OUT_FILE"' EXIT

# Compile every test program in progs/ into build/.
build_progs() {
	mkdir -p build
	local p
	for p in progs/*.c; do
		[ -e "$p" ] || continue
		cc -O0 -w -o "build/$(basename "$p" .c)" "$p" || exit 1
	done
}

# build_learner <source.c> <binary name>: your file, with the 42 flags.
build_learner() {
	if [ ! -f "$1" ]; then
		echo "No $1 yet. Create it in this folder ($(pwd)), then run this again."
		exit 1
	fi
	if ! cc -Wall -Wextra -Werror -o "build/$2" "$1"; then
		echo "${red}✗ $1 doesn't compile cleanly. Warnings count as errors.${off}"
		exit 1
	fi
	echo "${dim}built: build/$2 and the test programs${off}"
}

# check_usage <args...>: calling ./build/run wrong must print nothing on
# stdout and exit with 2. Define cleanup() before calling it.
check_usage() {
	local label out code
	label="$(show ./build/run "$@")"
	timeout -s KILL 5 ./build/run "$@" >"$OUT_FILE" 2>/dev/null </dev/null
	code=$?
	out="$(cat "$OUT_FILE")"
	cleanup
	if [ -z "$out" ] && [ "$code" -eq 2 ]; then
		pass "$label" "usage, exit 2"
	else
		fail "$label" "expected nothing on stdout and exit 2; got exit $code${out:+ and '$out'}"
	fi
}

# summary <lesson number>: the last line, and the exit status.
summary() {
	echo
	if [ "$FAIL" -eq 0 ]; then
		echo "${green}${bold}All $PASS cases pass.${off} Tell your teacher: done $1."
	else
		echo "${bold}$PASS passed, ${red}$FAIL failed.${off}"
	fi
	[ "$FAIL" -eq 0 ]
}
