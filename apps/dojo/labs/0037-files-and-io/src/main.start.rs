//! Lesson 37: a judge in one binary.
//!
//!   minijudge <tests-dir> <program> [args...]
//!
//! For every N.in in the folder (in numeric order: 1, 2, 10), run the program
//! with N.in as its stdin, read at most OUTPUT_CAP bytes of its stdout, and
//! compare the tokens with N.out. Print one line per test, then a summary:
//!     test 1: AC
//!     test 2: RE (signal 11)
//!     test 10: WA
//!     passed 1/3
//! Verdicts: AC, WA, OLE (more than OUTPUT_CAP bytes), RE (exit N) or RE (signal S).
//! Exit code: 0 if every test passed, 1 if any failed, 2 if the judge itself
//! couldn't run (bad usage, unreadable folder, an N.in without N.out, no tests),
//! with a one-line message on stderr starting "minijudge: ".

#![allow(unused_imports)]
use std::error::Error;
use std::fs::{self, File};
use std::io::{self, BufWriter, Read, Write};
use std::os::unix::process::ExitStatusExt;
use std::path::{Path, PathBuf};
use std::process::{Command, ExitStatus, Stdio, exit};

const OUTPUT_CAP: u64 = 64 * 1024;

/// What one run produced.
struct Run {
    stdout: Vec<u8>,
    /// It printed more than OUTPUT_CAP bytes (and was killed for it).
    capped: bool,
    status: ExitStatus,
}

/// The test numbers in `dir`, sorted numerically: every N with an N.in file.
/// An N.in without its N.out is an error, and so is a folder with no tests.
fn find_tests(dir: &Path) -> Result<Vec<u32>, Box<dyn Error>> {
    todo!()
}

/// Runs `command` with `input` as its stdin and reads at most OUTPUT_CAP + 1
/// bytes of its stdout. Lesson 3's trap, in Rust: stop reading while the pipe
/// is still open, then wait, and a program that keeps writing blocks on the
/// full pipe while you block in wait. Over the cap, kill it before waiting.
fn run_one(command: &[String], input: &Path) -> io::Result<Run> {
    todo!()
}

/// "AC", "WA", "OLE", "RE (exit N)" or "RE (signal S)", in lesson 9's order.
fn verdict(run: &Run, expected: &str) -> String {
    todo!()
}

/// Judges every test, prints the lines, and says whether all of them passed.
fn judge(dir: &Path, command: &[String]) -> Result<bool, Box<dyn Error>> {
    todo!()
}

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let [dir, command @ ..] = args.as_slice() else {
        eprintln!("minijudge: usage: minijudge <tests-dir> <program> [args...]");
        exit(2);
    };
    if command.is_empty() {
        eprintln!("minijudge: usage: minijudge <tests-dir> <program> [args...]");
        exit(2);
    }
    match judge(Path::new(dir), command) {
        Ok(true) => exit(0),
        Ok(false) => exit(1),
        Err(e) => {
            eprintln!("minijudge: {e}");
            exit(2);
        }
    }
}
