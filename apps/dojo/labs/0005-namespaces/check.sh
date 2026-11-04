#!/usr/bin/env bash
# Lesson 0005 checker: your box.c, a container built from namespaces.
#
#   bash check.sh build   build box and the Alpine root filesystem, check nothing
#   bash check.sh         build, then run every case
cd "$(dirname "$0")" || exit 1
. ../_lib/check-lib.sh

mkdir -p build
# The root filesystem: Alpine's, exported from Docker once (about 8 MB).
if [ ! -x build/rootfs/bin/busybox ]; then
	echo "${dim}preparing build/rootfs from alpine:3.20 (once)…${off}"
	rm -rf build/rootfs && mkdir -p build/rootfs
	docker image inspect alpine:3.20 >/dev/null 2>&1 || docker pull -q alpine:3.20 >/dev/null || { echo "Docker is needed once, to export Alpine's files."; exit 1; }
	cid=$(docker create alpine:3.20 /bin/true) || exit 1
	docker export "$cid" | tar -x -C build/rootfs 2>/dev/null
	docker rm "$cid" >/dev/null
fi
build_learner box.c box
[ "${1:-}" = build ] && exit 0

BOX=./build/box
ROOT=build/rootfs
cleanup() {
	pkill -KILL -f 'sleep 23\.1406' 2>/dev/null
	rm -f "$ROOT/etc/box-was-here"
	# A broken run can leave a regular file where a device should be mounted.
	[ -f "$ROOT/dev/null" ] && rm -f "$ROOT/dev/null"
	sleep 0.05
}
cleanup

# run_box <expected stdout, exactly> <command inside the box...>
run_box() {
	local expected="$1" label out
	shift
	label="$(show box rootfs "$@")"
	timeout -s KILL 5 "$BOX" "$ROOT" "$@" >"$OUT_FILE" 2>/dev/null
	out="$(cat "$OUT_FILE")"
	if [ "$out" = "$expected" ]; then
		pass "$label" "${out//$'\n'/ ⏎ }"
	else
		fail "$label" "expected '${expected//$'\n'/ ⏎ }', got '${out//$'\n'/ ⏎ }'"
	fi
}

# run_box_match <regex for the whole stdout> <command...>
run_box_match() {
	local re="$1" label out
	shift
	label="$(show box rootfs "$@")"
	timeout -s KILL 5 "$BOX" "$ROOT" "$@" >"$OUT_FILE" 2>/dev/null
	out="$(cat "$OUT_FILE")"
	if [[ "$out" =~ $re ]]; then
		pass "$label" "${out//$'\n'/ ⏎ }"
	else
		fail "$label" "got '${out//$'\n'/ ⏎ }'"
	fi
}

section "Its own names: UTS and PID"
run_box $'box\nexit 0' /bin/hostname
run_box $'1\nexit 0' /bin/sh -c 'echo $$'
run_box_match $'^[1-3]\nexit 0$' /bin/sh -c 'ls /proc | grep -c "^[0-9]"'

section "Its own root: the user namespace"
run_box $'0\nexit 0' /bin/sh -c 'id -u'
timeout -s KILL 5 "$BOX" "$ROOT" /bin/sh -c 'touch /etc/box-was-here' >/dev/null 2>&1
owner=$(stat -c %u "$ROOT/etc/box-was-here" 2>/dev/null || echo missing)
if [ "$owner" = "$(id -u)" ]; then
	pass "root's file, seen from outside" "owned by you (uid $owner), not by the host's root"
else
	fail "root's file, seen from outside" "expected owner uid $(id -u), got $owner"
fi
cleanup

section "Its own files: mount namespace and chroot"
run_box_match $'^3\\.20\\.[0-9]+\nexit 0$' /bin/cat /etc/alpine-release
run_box $'sealed\nexit 0' /bin/sh -c 'test -e /mnt/c || test -e /home/'"$USER"' && echo leaked || echo sealed'
# A real device, not a regular file that a write happened to create.
run_box $'device\nexit 0' /bin/sh -c 'test -c /dev/null && test -c /dev/urandom && echo device || echo missing'

section "Its own network"
run_box $'1\nexit 0' /bin/sh -c 'ip -o link | wc -l'

section "PID 1 is special"
run_box $'still alive\nexit 0' /bin/sh -c 'kill -TERM $$; echo still alive'
timeout -s KILL 5 "$BOX" "$ROOT" /bin/sh -c '(setsid sleep 23.1406 &); sleep 0.2' >/dev/null 2>&1
sleep 0.3
if pgrep -f 'sleep 23\.1406' >/dev/null; then
	fail "the escaper from lesson 2" "its grandchild survived: did PID 1's death not take the namespace down?"
else
	pass "the escaper from lesson 2" "gone: when PID 1 died, the kernel killed the namespace"
fi
cleanup

section "Exit codes still travel"
run_box 'exit 3' /bin/sh -c 'exit 3'
code=0; "$BOX" >/dev/null 2>&1 || code=$?
if [ "$code" = 2 ]; then pass "box   (no arguments)" "usage, exit 2"; else fail "box   (no arguments)" "expected exit 2, got $code"; fi

summary 0005
