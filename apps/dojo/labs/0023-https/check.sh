#!/usr/bin/env bash
cd "$(dirname "$0")" || exit 1
[ -f make-certs.sh ] || { echo "No make-certs.sh yet: see README.md."; exit 1; }
command -v openssl >/dev/null || { echo "This lab needs openssl."; exit 1; }
rm -rf out
bash make-certs.sh > /tmp/lab23-$$.log 2>&1 || { echo "make-certs.sh failed:"; tail -8 /tmp/lab23-$$.log; rm -f /tmp/lab23-$$.log; exit 1; }
rm -f /tmp/lab23-$$.log
node check.mjs "$@"
