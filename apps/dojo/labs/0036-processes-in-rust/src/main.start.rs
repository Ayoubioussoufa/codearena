//! Lesson 36: lesson 2's `run -t`, rewritten in Rust.
//!
//!   run -t <ms> <program> [args...]
//!
//! Prints two lines on stdout: "exit N", "signal S" or "timeout", then
//! "time_ms=N". At the deadline, kill the program's whole process group.
//! A program that can't be started: "exit 127", as a shell would say.
//! Called wrong (no -t, a deadline that isn't a positive whole number, no
//! program): nothing on stdout, a usage line on stderr, exit code 2.

#![allow(unused_imports)]
use std::os::unix::process::{CommandExt, ExitStatusExt};
use std::process::{Command, exit};
use std::time::{Duration, Instant};

/// `-t <ms> program args…` → (ms, [program, args…]); anything else → None.
fn parse_args(args: &[String]) -> Option<(u64, &[String])> {
    todo!()
}

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let Some((limit_ms, command)) = parse_args(&args) else {
        eprintln!("usage: run -t <ms> <program> [args...]");
        exit(2);
    };
    todo!("start {command:?} in its own process group, wait up to {limit_ms} ms, report")
}
