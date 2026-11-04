#!/usr/bin/env bash
# Lesson 0003 checker: your run.c, now feeding input and capturing output.
#
#   bash check.sh build   build everything (and the test inputs) into build/
#   bash check.sh         build, then run every case
cd "$(dirname "$0")" || exit 1
. ../_lib/check-lib.sh

build_progs
build_learner run.c run

# Test inputs, and the outputs a correct runner must save.
mkdir -p build/in build/expect
printf 'hello\n' >build/in/hello.txt
printf '2 3\n' >build/in/two-numbers.txt
head -c 102400 /dev/zero | tr '\0' a >build/in/100k.txt
head -c 1048576 /dev/urandom >build/in/1m.bin
printf '5\n' >build/expect/sum.txt
: >build/expect/empty.txt
printf '102400\n' >build/expect/wc.txt
{ head -c 300000 /dev/zero | tr '\0' x; echo; } >build/expect/300k.txt
head -c 10000 /dev/zero | tr '\0' x >build/expect/exact.txt
[ "${1:-}" = build ] && exit 0

OUT=build/out.txt
cleanup() {
	pkill -KILL -x yes 2>/dev/null
	pkill -KILL -f 'build/sleeper' 2>/dev/null
	sleep 0.05
}
cleanup

# check_io <expected line 1> <expected output: a file, or size:LO-HI> <max ms> <stdin: null|open> <run args...>
# Checks the three report lines, the saved output, the time, and that no `yes` survived.
check_io() {
	local expected="$1" want="$2" max="$3" stdin="$4"
	shift 4
	local label t0 t1 elapsed first second third size lo hi problems=()
	label="$(show ./build/run "$@")"
	rm -f "$OUT"
	t0=$(now_ms)
	if [ "$stdin" = open ]; then
		# Your stdin is a pipe that stays open and never sends anything, like a terminal
		# nobody types into. A child that inherits it waits forever.
		timeout -s KILL 5 ./build/run "$@" >"$OUT_FILE" 2>/dev/null < <(sleep 4)
	else
		timeout -s KILL 5 ./build/run "$@" >"$OUT_FILE" 2>/dev/null </dev/null
	fi
	t1=$(now_ms)
	elapsed=$((t1 - t0))
	first="$(sed -n 1p "$OUT_FILE")"
	second="$(sed -n 2p "$OUT_FILE")"
	third="$(sed -n 3p "$OUT_FILE")"
	size=missing
	[ -f "$OUT" ] && size=$(stat -c %s "$OUT")

	[ "$first" = "$expected" ] || problems+=("expected '$expected', got '${first:-(nothing)}'")
	[[ "$second" =~ ^time_ms=[0-9]+$ ]] || problems+=("line 2: expected time_ms=<n>, got '${second:-(nothing)}'")
	if [[ ! "$third" =~ ^output_bytes=[0-9]+$ ]]; then
		problems+=("line 3: expected output_bytes=<n>, got '${third:-(nothing)}'")
	elif [ "${third#output_bytes=}" != "$size" ]; then
		problems+=("reports ${third#output_bytes=} bytes, but $OUT holds $size")
	fi
	case "$want" in
	size:*)
		lo=${want#size:}; hi=${lo#*-}; lo=${lo%-*}
		if [ "$size" = missing ] || [ "$size" -lt "$lo" ] || [ "$size" -gt "$hi" ]; then
			problems+=("$OUT should hold $lo–$hi bytes, holds $size")
		fi
		;;
	*)
		if ! cmp -s "$want" "$OUT" 2>/dev/null; then
			problems+=("$OUT differs from what the program printed ($(stat -c %s "$want") bytes expected, got $size)")
		fi
		;;
	esac
	[ "$elapsed" -le "$max" ] || problems+=("took $elapsed ms, expected at most $max ms")
	sleep 0.1
	pgrep -x yes >/dev/null && problems+=("'yes' is still running after your runner returned")
	cleanup

	if [ ${#problems[@]} -eq 0 ]; then
		pass "$label" "$first, ${size} bytes saved"
	else
		local joined
		joined="$(printf '%s · ' "${problems[@]}")"
		fail "$label" "${joined% · }"
	fi
}

section "Feeding input, saving output"
check_io "exit 0" build/in/hello.txt    1500 null -t 2000 -i build/in/hello.txt -o "$OUT" cat
check_io "exit 0" build/expect/sum.txt  1500 null -t 2000 -i build/in/two-numbers.txt -o "$OUT" python3 -c 'a, b = map(int, input().split()); print(a + b)'
check_io "exit 0" build/expect/empty.txt 900 open -t 2000 -o "$OUT" cat
check_io "exit 0" build/expect/wc.txt   1500 null -t 2000 -i build/in/100k.txt -o "$OUT" wc -c

section "Big outputs, big inputs"
check_io "exit 0" build/expect/300k.txt 2000 null -t 3000 -o "$OUT" python3 -c "print('x' * 300000)"
check_io "exit 0" build/in/1m.bin       2000 null -t 3000 -i build/in/1m.bin -o "$OUT" cat

section "The output limit"
check_io "output-limit" size:10000-10001 1500 null -t 3000 -o "$OUT" -m 10000 yes
check_io "exit 0" build/expect/exact.txt 1500 null -t 3000 -o "$OUT" -m 10000 python3 -c "import sys; sys.stdout.write('x' * 10000)"
check_io "output-limit" size:10000-10001 1500 null -t 3000 -o "$OUT" -m 10000 python3 -c "import sys; sys.stdout.write('x' * 10001)"

section "The deadline still holds"
check_io "timeout" size:0-0 1500 null -t 500 -o "$OUT" ./build/sleeper

section "Called wrong"
check_usage -t 500 cat
check_usage -t 500 -o "$OUT" -m 0 cat
check_usage -t 500 -i build/in/no-such-file.txt -o "$OUT" cat
check_usage -t 500 -o "$OUT"

summary 0003
