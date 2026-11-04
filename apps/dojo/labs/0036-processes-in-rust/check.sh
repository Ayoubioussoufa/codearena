#!/usr/bin/env bash
# Lesson 0036 checker: lesson 2's cases, run against your Rust `run`.
#
#   bash check.sh build   build everything into build/, check nothing
#   bash check.sh         build, then run every case
cd "$(dirname "$0")" || exit 1
. ../_lib/check-lib.sh
. ../_lib/cargo-lib.sh

need_cargo
need_file src/main.rs src/main.start.rs
# Without pgrep, "nothing left behind" would pass without looking.
command -v pgrep >/dev/null || { echo "This checker needs pgrep: sudo apt install procps"; exit 1; }
build_progs
log="$(mktemp)"
if ! cargo build --quiet --color never 2>"$log"; then
	awk '/^error/ { n++ } n == 1 { print } n == 1 && /^$/ { exit }' "$log" | sed -n '1,40p'
	echo "${red}✗ It doesn't compile yet.${off} Fix the first error above."
	rm -f "$log"
	exit 1
fi
rm -f "$log"
cp target/debug/run build/run
echo "${dim}built: build/run (from target/debug/run) and lesson 2's test programs${off}"
[ "${1:-}" = build ] && exit 0

MARKERS='sleep (31\.4159|27\.1828|23\.1406)'
TESTPROGS='build/(spin|sleeper|ignore_term|escaper)'

# Anything an earlier, broken run left behind would fool the checks below.
cleanup() {
	pkill -KILL -f "$MARKERS" 2>/dev/null
	pkill -KILL -f "$TESTPROGS" 2>/dev/null
	sleep 0.05
}
cleanup

# check_run <expected first line> <min ms> <max ms> <marker|-> <command...>
# Runs ./build/run <command...>, then checks the first line, the time_ms line,
# how long it really took, and (with a marker) that nothing it started survived.
check_run() {
	local expected="$1" min="$2" max="$3" marker="$4"
	shift 4
	local label t0 t1 out first second elapsed problems=()
	label="$(show ./build/run "$@")"
	t0=$(now_ms)
	timeout -s KILL 5 ./build/run "$@" >"$OUT_FILE" 2>/dev/null
	t1=$(now_ms)
	out="$(cat "$OUT_FILE")"
	elapsed=$((t1 - t0))
	first="$(printf '%s\n' "$out" | sed -n 1p)"
	second="$(printf '%s\n' "$out" | sed -n 2p)"

	[ "$first" = "$expected" ] || problems+=("expected '$expected', got '${first:-(nothing)}'")
	if [[ ! "$second" =~ ^time_ms=[0-9]+$ ]]; then
		problems+=("line 2: expected time_ms=<n>, got '${second:-(nothing)}'")
	elif [ "${second#time_ms=}" -gt $((elapsed + 50)) ]; then
		problems+=("reports ${second#time_ms=} ms, but it took $elapsed ms")
	fi
	if [ "$elapsed" -lt "$min" ] || [ "$elapsed" -gt "$max" ]; then
		problems+=("took $elapsed ms, expected $min–$max ms")
	fi
	if [ "$marker" != - ]; then
		sleep 0.2
		if pgrep -f "$marker" >/dev/null; then
			problems+=("still running after your timeout: '$(pgrep -af "$marker" | head -1 | cut -d' ' -f2-)'")
		fi
	fi
	cleanup

	if [ ${#problems[@]} -eq 0 ]; then
		pass "$label" "$first, ${elapsed} ms"
	else
		local joined
		joined="$(printf '%s · ' "${problems[@]}")"
		fail "$label" "${joined% · }"
	fi
}

section "Ends by itself, before the deadline"
check_run "exit 0"    0 1500 - -t 2000 ./build/ok
check_run "exit 3"    0 1500 - -t 2000 ./build/exit3
check_run "signal 11" 0 1500 - -t 2000 ./build/segv
check_run "exit 0"  280 1500 - -t 2000 sh -c 'sleep 0.3'
check_run "exit 127"  0 1500 - -t 2000 ./no-such-program

section "Stopped at the deadline"
check_run "timeout" 450 1500 - -t 500 ./build/spin
check_run "timeout" 450 1500 - -t 500 ./build/sleeper
check_run "timeout" 450 1500 - -t 500 ./build/ignore_term

section "Nothing left behind"
check_run "timeout" 450 1500 'sleep 31\.4159' -t 500 sh -c 'sleep 31.4159; :'
check_run "timeout" 450 1500 'sleep 27\.1828' -t 500 sh -c 'sleep 27.1828 & wait'

section "Called wrong"
check_usage ./build/ok
check_usage -t abc ./build/ok
check_usage -t 0 ./build/ok
check_usage -t 500

section "The escape (not graded)"
timeout -s KILL 5 ./build/run -t 500 ./build/escaper >/dev/null 2>&1
sleep 0.2
if pgrep -f 'sleep 23\.1406' >/dev/null; then
	note "$(show ./build/run -t 500 ./build/escaper)" "the grandchild survived, as expected"
	note "" "It called setsid() and left your group. Lessons 5 and 6 close this hole."
else
	note "$(show ./build/run -t 500 ./build/escaper)" "nothing survived: what did you use? Tell your teacher"
fi
cleanup

summary 0036
