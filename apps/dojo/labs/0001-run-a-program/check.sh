#!/usr/bin/env bash
# Lesson 0001 checker. You write run.c; this builds it and runs it against
# the test programs in progs/.
#
#   bash check.sh build   build everything into build/, check nothing
#   bash check.sh         build, then run every case
set -u
cd "$(dirname "$0")" || exit 1

green=$'\e[32m'; red=$'\e[31m'; dim=$'\e[2m'; bold=$'\e[1m'; off=$'\e[0m'
[ -t 1 ] || { green=; red=; dim=; bold=; off=; }

mkdir -p build
for p in progs/*.c; do
	cc -O0 -w -o "build/$(basename "$p" .c)" "$p" || exit 1
done

if [ ! -f run.c ]; then
	echo "No run.c yet. Create it in this folder ($(pwd)), then run this again."
	exit 1
fi
# The 42 flags: a warning is a bug you haven't met yet.
if ! cc -Wall -Wextra -Werror -o build/run run.c; then
	echo "${red}✗ run.c doesn't compile cleanly. Warnings count as errors.${off}"
	exit 1
fi
echo "${dim}built: build/run and the test programs${off}"
[ "${1:-}" = build ] && exit 0

pass=0
fail=0

# The command as you'd type it, quotes included.
show() {
	local out="./build/run" a
	for a in "$@"; do
		case "$a" in *' '*) out+=" '$a'" ;; *) out+=" $a" ;; esac
	done
	printf '%s' "$out"
}

# case <expected stdout> <command...>
case_() {
	local expected="$1" got label
	shift
	label="$(show "$@")"
	got="$(timeout 5 ./build/run "$@" 2>/dev/null)"
	if [ "$got" = "$expected" ]; then
		printf '  %s✓%s %-44s %s\n' "$green" "$off" "$label" "${got//$'\n'/ ⏎ }"
		pass=$((pass + 1))
	else
		got="${got//$'\n'/ ⏎ }"
		printf '  %s✗%s %-44s expected %s%s%s, got %s%s%s\n' "$red" "$off" "$label" \
			"$bold" "${expected//$'\n'/ ⏎ }" "$off" "$bold" "${got:-(nothing)}" "$off"
		fail=$((fail + 1))
	fi
}

echo
echo "${bold}Programs that end by themselves${off}"
case_ "exit 0"   ./build/ok
case_ "exit 3"   ./build/exit3
case_ "exit 44"  ./build/exit300
case_ "exit 5"   sh -c 'exit 5'
case_ "exit 137" sh -c 'exit 137'
case_ "exit 1"   python3 -c '1/0'

echo "${bold}Programs a signal killed${off}"
case_ "signal 11" ./build/segv
case_ "signal 8"  ./build/div0
case_ "signal 6"  ./build/abort
case_ "signal 9"  ./build/selfkill
case_ "signal 15" sh -c 'kill -TERM $$'

echo "${bold}The child shares your terminal${off}"
case_ $'hi\nexit 0' echo hi

echo "${bold}When things go wrong${off}"
case_ "exit 127" ./build/no-such-program
err="$(./build/run 2>&1 >/dev/null)"
code=$?
out="$(./build/run 2>/dev/null)"
if [ -z "$out" ] && [ "$code" = 2 ] && [ -n "$err" ]; then
	printf '  %s✓%s %-44s %s\n' "$green" "$off" "./build/run   (no program)" "usage on stderr, exit 2"
	pass=$((pass + 1))
else
	printf '  %s✗%s %-44s expected a usage line on stderr, nothing on stdout, exit status 2; got status %s\n' \
		"$red" "$off" "./build/run   (no program)" "$code"
	fail=$((fail + 1))
fi

echo
if [ "$fail" -eq 0 ]; then
	echo "${green}${bold}All $pass cases pass.${off} Tell your teacher: done 0001."
else
	echo "${bold}$pass passed, ${red}$fail failed.${off}"
fi

# The optional challenge: run's own exit status, the way a shell reports it.
echo
echo "${dim}Challenge (optional): make run exit the way a shell would report the child.${off}"
bonus() {
	local want="$1"
	shift
	./build/run "$@" >/dev/null 2>&1
	local got=$?
	if [ "$got" = "$want" ]; then
		printf '  %s✓%s %-44s %s\n' "$green" "$off" "$(show "$@"); echo \$?" "$got"
	else
		printf '  %s·%s %-44s %s\n' "$dim" "$off" "$(show "$@"); echo \$?" "want $want, got $got"
	fi
}
bonus 3   ./build/exit3
bonus 139 ./build/segv
bonus 137 ./build/selfkill
bonus 137 sh -c 'exit 137'

[ "$fail" -eq 0 ]
