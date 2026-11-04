#!/usr/bin/env bash
# Lesson 0042 checker: fasttok 0.2, parallel, formatted and lint-free.
#
#   bash check.sh        fmt and clippy, then build with maturin and run the Python tests
cd "$(dirname "$0")" || exit 1
. ../_lib/check-lib.sh
. ../_lib/cargo-lib.sh

need_cargo
if [ ! -f src/bpe.rs ] || [ ! -f src/lib.rs ]; then
	echo "Start from your lesson-41 module:"
	echo "  cp ../0041-pyo3-extension/src/bpe.rs ../0041-pyo3-extension/src/lib.rs src/"
	exit 1
fi
if ! python3 -m venv --help >/dev/null 2>&1; then
	echo "This checker needs Python's venv module: sudo apt install python3-venv"
	exit 1
fi

if [ ! -x .venv/bin/maturin ]; then
	echo "${dim}first run: creating .venv and installing maturin…${off}"
	python3 -m venv .venv || exit 1
	.venv/bin/pip install --quiet "maturin>=1.9,<2.0" || exit 1
fi
export VIRTUAL_ENV="$PWD/.venv" PATH="$PWD/.venv/bin:$PATH"

section "Shipped like a team would"
if cargo fmt --version >/dev/null 2>&1; then
	if cargo fmt --check >/dev/null 2>&1; then
		pass "cargo fmt --check" "formatted"
	else
		fail "cargo fmt --check" "run: cargo fmt"
	fi
else
	fail "cargo fmt --check" "rustfmt missing: rustup component add rustfmt"
fi
if cargo clippy --version >/dev/null 2>&1; then
	log="$(mktemp)"
	if cargo clippy --quiet --color never -- -D warnings >"$log" 2>&1; then
		pass "cargo clippy -- -D warnings" "no lints"
	else
		fail "cargo clippy -- -D warnings" "$(grep -m1 -E '^(error|warning)' "$log")"
		sed -n '2,12p' "$log" | sed 's/^/      /'
	fi
	rm -f "$log"
else
	fail "cargo clippy -- -D warnings" "clippy missing: rustup component add clippy"
fi

log="$(mktemp)"
if ! maturin develop --release --quiet >"$log" 2>&1; then
	if grep -q '^error' "$log"; then
		awk '/^error/ { n++ } n == 1 { print } n == 1 && /^$/ { exit }' "$log" | sed -n '1,40p'
		echo "${red}✗ It doesn't compile yet.${off} Fix the first error above."
	else
		tail -20 "$log"
		echo "${red}✗ maturin develop failed.${off}"
	fi
	rm -f "$log"
	exit 1
fi
rm -f "$log"
echo "${dim}built and installed fasttok into .venv (release)${off}"

section "encode_batch, from Python"
out="$(mktemp)"
(cd tests && python -m unittest -v test_batch) >"$out" 2>&1
# unittest -v prints "test_x (module.Class.test_x) ... ok"; a test that prints
# something gets its "ok" on a later line, so remember which test is running.
label() { local n="${1%% (*}"; n="${n#test_}"; printf '%s' "${n//_/ }"; }
pending=""
while IFS= read -r line; do
	case "$line" in
	"    batch of"*) note "speed" "${line#    }" ;;
	*" ... ok") pass "$(label "$line")"; pending="" ;;
	*" ... FAIL" | *" ... ERROR") fail "$(label "$line")"; pending="" ;;
	*" ... ") pending="$(label "$line")" ;;
	ok) [ -n "$pending" ] && pass "$pending"; pending="" ;;
	*" ... skipped"*) note "$(label "$line")" "skipped: ${line##*skipped }" ;;
	FAIL | ERROR) [ -n "$pending" ] && fail "$pending"; pending="" ;;
	esac
done <"$out"
if grep -q '^ImportError\|^ModuleNotFoundError\|Error: ' "$out" && [ "$PASS" -eq 0 ]; then
	sed -n '1,25p' "$out"
fi
grep -E '^(AssertionError|ValueError|TypeError|AttributeError|NotImplementedError|pyo3_runtime.PanicException)' "$out" | sed 's/^/      /' | head -12
rm -f "$out"
summary 0042
