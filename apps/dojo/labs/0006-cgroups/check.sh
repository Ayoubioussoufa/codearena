#!/usr/bin/env bash
# Lesson 0006 checker: your cage.c, limits the kernel enforces.
#
# Your cage runs inside a systemd user scope with Delegate=yes: that's the
# part of the cgroup tree systemd hands to you, so no sudo is needed. The scope
# also has TasksMax=300, a safety net in case your pids limit doesn't work yet.
cd "$(dirname "$0")" || exit 1
. ../_lib/check-lib.sh

build_progs
build_learner cage.c cage
[ "${1:-}" = build ] && exit 0

if ! systemd-run --user --scope --quiet true 2>/dev/null; then
	echo "${red}systemd-run --user doesn't work here.${off} This lab needs a systemd user session (WSL: systemd=true in /etc/wsl.conf)."
	exit 1
fi
SCOPE=(systemd-run --user --scope -p Delegate=yes -p TasksMax=300 --quiet)

cleanup() {
	pkill -KILL -f 'build/forkbomb' 2>/dev/null
	pkill -KILL -f 'sleep 23\.1406' 2>/dev/null
	sleep 0.05
}
cleanup

# run_cage <args...>: sets PROG (the program's own output), and the report: L1, OOM, REFUSED, CPU.
run_cage() {
	timeout -s KILL 15 "${SCOPE[@]}" ./build/cage "$@" >"$OUT_FILE" 2>/dev/null
	local all
	all="$(cat "$OUT_FILE")"
	PROG="$(printf '%s\n' "$all" | head -n -4)"
	L1="$(printf '%s\n' "$all" | tail -n 4 | sed -n 1p)"
	OOM="$(printf '%s\n' "$all" | grep -o '^oom_kills=[0-9-]*' | cut -d= -f2)"
	REFUSED="$(printf '%s\n' "$all" | grep -o '^pids_refused=[0-9-]*' | cut -d= -f2)"
	CPU="$(printf '%s\n' "$all" | grep -o '^cpu_ms=[0-9-]*' | cut -d= -f2)"
	REPORT="${all//$'\n'/ ⏎ }"
}

# verdict <label> <problems...>: pass if no problem strings were given.
verdict() {
	local label="$1"
	shift
	if [ $# -eq 0 ]; then pass "$label" "$REPORT"; else
		local joined
		joined="$(printf '%s · ' "$@")"
		fail "$label" "${joined% · } (got: $REPORT)"
	fi
}

section "Memory: memory.max"
run_cage -m 50000000 ./build/hog 200
p=(); [ "$L1" = "signal 9" ] || p+=("expected 'signal 9'"); [ "${OOM:-}" = 1 ] || p+=("expected oom_kills=1")
verdict "$(show cage -m 50000000 hog 200)" "${p[@]}"
run_cage -m 50000000 ./build/hog 20
p=(); [ "$PROG" = "touched 20 MB" ] || p+=("the program should finish"); [ "$L1" = "exit 0" ] || p+=("expected 'exit 0'"); [ "${OOM:-}" = 0 ] || p+=("expected oom_kills=0")
verdict "$(show cage -m 50000000 hog 20)" "${p[@]}"

section "Processes: pids.max"
run_cage -p 16 ./build/forkbomb
forked="${PROG#forked }"
p=(); [[ "$forked" =~ ^[0-9]+$ ]] && [ "$forked" -le 15 ] || p+=("expected at most 15 children, the program said '${PROG}'")
[ "$L1" = "exit 0" ] || p+=("expected 'exit 0'"); [ "${REFUSED:-0}" -ge 1 ] 2>/dev/null || p+=("expected pids_refused ≥ 1")
sleep 0.2; pgrep -f 'build/forkbomb' >/dev/null && p+=("children survived: kill everything left in the box after the run")
verdict "$(show cage -p 16 forkbomb)" "${p[@]}"
cleanup

section "CPU: cpu.max (2 seconds of spinning)"
run_cage -c 25 ./build/spin
p=(); [ "$L1" = "exit 0" ] || p+=("expected 'exit 0'"); { [ "${CPU:-0}" -ge 300 ] && [ "${CPU:-0}" -le 800 ]; } 2>/dev/null || p+=("expected cpu_ms between 300 and 800 at 25%")
verdict "$(show cage -c 25 spin)" "${p[@]}"
run_cage -c 100 ./build/spin
p=(); { [ "${CPU:-0}" -ge 1500 ]; } 2>/dev/null || p+=("expected cpu_ms ≥ 1500 at 100%")
verdict "$(show cage -c 100 spin)" "${p[@]}"

section "Nothing left behind: cgroup.kill"
run_cage sh -c 'sleep 23.1406 & exit 0'
sleep 0.2
p=(); [ "$L1" = "exit 0" ] || p+=("expected 'exit 0'"); pgrep -f 'sleep 23\.1406' >/dev/null && p+=("the background sleep survived")
verdict "$(show cage sh -c 'sleep 23.1406 & exit 0')" "${p[@]}"
cleanup

section "No limits asked, none applied"
run_cage ./build/hog 20
p=(); [ "$L1" = "exit 0" ] || p+=("expected 'exit 0'")
verdict "$(show cage hog 20)" "${p[@]}"

section "Called wrong"
for args in "" "-m 0 ./build/hog" "-m abc ./build/hog" "-p 16"; do
	# shellcheck disable=SC2086
	timeout -s KILL 5 ./build/cage $args >"$OUT_FILE" 2>/dev/null
	code=$?
	if [ "$code" = 2 ] && [ ! -s "$OUT_FILE" ]; then pass "cage $args" "usage, exit 2"; else fail "cage $args" "expected exit 2 and nothing on stdout, got exit $code"; fi
done

summary 0006
