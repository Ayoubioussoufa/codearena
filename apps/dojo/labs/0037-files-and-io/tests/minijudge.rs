// The kit's tests. Don't edit them: make them pass. They run your binary
// against lesson 37's C programs, which check.sh compiles into build/.
use std::path::PathBuf;
use std::process::{Command, Output, Stdio};
use std::sync::mpsc;
use std::time::{Duration, Instant};

/// Runs minijudge with a watchdog: if it hasn't finished after 10 seconds, it's
/// killed and the test fails, instead of hanging the whole checker.
fn judge(dir: &str, program: &str) -> (Output, Duration) {
    let start = Instant::now();
    let child = Command::new(env!("CARGO_BIN_EXE_minijudge"))
        .arg(dir)
        .arg(program)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("couldn't start minijudge");
    let pid = child.id().to_string();
    let (tx, rx) = mpsc::channel();
    std::thread::spawn(move || {
        let _ = tx.send(child.wait_with_output());
    });
    match rx.recv_timeout(Duration::from_secs(10)) {
        Ok(out) => (out.expect("couldn't read minijudge's output"), start.elapsed()),
        Err(_) => {
            let _ = Command::new("kill").args(["-9", &pid]).status();
            panic!("minijudge hung for 10 s: did it wait for a program that was still writing?");
        }
    }
}

fn lines(out: &Output) -> Vec<String> {
    String::from_utf8_lossy(&out.stdout).lines().map(str::to_string).collect()
}

#[test]
fn a_correct_program_passes_every_test_in_numeric_order() {
    let (out, _) = judge("tests/data/sum", "build/sum");
    assert_eq!(lines(&out), ["test 1: AC", "test 2: AC", "test 10: AC", "passed 3/3"]);
    assert_eq!(out.status.code(), Some(0));
}

#[test]
fn a_wrong_answer_is_reported_on_its_test() {
    let (out, _) = judge("tests/data/sum", "build/sum_off");
    assert_eq!(lines(&out), ["test 1: AC", "test 2: AC", "test 10: WA", "passed 2/3"]);
    assert_eq!(out.status.code(), Some(1));
}

#[test]
fn a_crash_after_the_right_output_is_a_runtime_error() {
    let (out, _) = judge("tests/data/sum", "build/crash");
    assert_eq!(lines(&out), ["test 1: RE (signal 11)", "test 2: RE (signal 11)", "test 10: RE (signal 11)", "passed 0/3"]);
}

#[test]
fn a_non_zero_exit_is_a_runtime_error() {
    let (out, _) = judge("tests/data/sum", "build/exit3");
    assert_eq!(lines(&out)[0], "test 1: RE (exit 3)");
}

#[test]
fn a_flood_is_capped_and_nothing_hangs() {
    let (out, took) = judge("tests/data/sum", "build/flood");
    assert_eq!(lines(&out), ["test 1: OLE", "test 2: OLE", "test 10: OLE", "passed 0/3"]);
    assert!(took < Duration::from_secs(5), "took {took:?}: did you wait before killing?");
}

#[test]
fn a_missing_answer_file_stops_the_judge() {
    let (out, _) = judge("tests/data/no-answer", "build/sum");
    assert_eq!(out.status.code(), Some(2));
    assert!(out.stdout.is_empty(), "nothing on stdout when the judge can't run");
    let err = String::from_utf8_lossy(&out.stderr);
    assert!(err.starts_with("minijudge: ") && err.contains("1.out"), "stderr was {err:?}");
}

#[test]
fn a_missing_folder_stops_the_judge() {
    let (out, _) = judge("tests/data/no-such-folder", "build/sum");
    assert_eq!(out.status.code(), Some(2));
    assert!(String::from_utf8_lossy(&out.stderr).starts_with("minijudge: "));
}

#[test]
fn an_empty_folder_has_no_tests() {
    let empty: PathBuf = [env!("CARGO_TARGET_TMPDIR"), "empty-tests"].iter().collect();
    std::fs::create_dir_all(&empty).unwrap();
    let (out, _) = judge(empty.to_str().unwrap(), "build/sum");
    assert_eq!(out.status.code(), Some(2));
}

#[test]
fn usage_errors_exit_2() {
    let out = Command::new(env!("CARGO_BIN_EXE_minijudge")).arg("tests/data/sum").output().unwrap();
    assert_eq!(out.status.code(), Some(2));
    assert!(out.stdout.is_empty());
}
