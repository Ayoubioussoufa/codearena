# Shared helpers for the Rust labs (lesson 28 onwards). Source it after check-lib.sh:
#   cd "$(dirname "$0")" || exit 1
#   . ../_lib/check-lib.sh
#   . ../_lib/cargo-lib.sh
# The kit's tests live in tests/; you write the file(s) in src/ the lesson names.
# shellcheck shell=bash

# need_cargo: stop with the install hint if there's no toolchain yet.
need_cargo() {
	if ! command -v cargo >/dev/null 2>&1; then
		echo "cargo isn't installed yet. Lesson 28, step 1: install rustup, then open a new terminal."
		exit 1
	fi
}

# need_file <file> <starter>: your file must exist; point at the starter if it doesn't.
need_file() {
	if [ ! -f "$1" ]; then
		echo "No $1 yet. Start from the kit's version:"
		echo "  cp $2 $1"
		exit 1
	fi
}

# compile_or_explain [cargo args...]: build the tests; on a compile error, show
# the first error in full and stop. Rust's errors are the lesson: read them.
compile_or_explain() {
	local log code
	log="$(mktemp)"
	if ! cargo test --no-run --color never "$@" >"$log" 2>&1; then
		awk '/^error/ { n++ } n == 1 { print } n == 1 && /^$/ { exit }' "$log" | sed -n '1,40p'
		code="$(grep -m1 -oE '^error\[E[0-9]+\]' "$log" | grep -oE 'E[0-9]+')"
		[ -n "$code" ] && echo "${dim}The long story of this error: rustc --explain $code${off}"
		echo
		echo "${red}✗ It doesn't compile yet.${off} Fix the first error above; later ones often follow from it."
		echo "${dim}  Full output: cargo test --no-run${off}"
		rm -f "$log"
		exit 1
	fi
	rm -f "$log"
}

# run_cargo_tests [cargo args...]: run the kit's tests one at a time and print
# one line per test, its name as a sentence, with the panic message under a failure.
run_cargo_tests() {
	local out name status label detail
	out="$(mktemp)"
	cargo test --color never --no-fail-fast "$@" -- --test-threads=1 >"$out" 2>/dev/null
	while read -r name status; do
		label="${name##*::}"
		label="${label//_/ }"
		if [ "$status" = ok ]; then
			pass "$label"
			continue
		fi
		fail "$label"
		# The block "---- <name> stdout ----" holds the panic; keep its first message lines.
		detail="$(awk -v n="---- $name stdout ----" '
			$0 == n { f = 1; next }
			/^---- / || /^failures:$/ { f = 0 }
			f && /panicked at/ { p = 1; next }
			f && p && NF && !/^note: run with/ { print; if (++c == 4) exit }' "$out")"
		[ -n "$detail" ] && printf '%s\n' "$detail" | sed "s/^/      /"
	done < <(sed -nE 's/^test ([^ ]+) \.\.\. (ok|FAILED)$/\1 \2/p' "$out")
	rm -f "$out"
}
