// The kit's tests. Don't edit them: make them pass.
use limits::{Checker, ConfigError, Limits, LoadError, load, parse};
use std::path::Path;

const FULL: &str = "# Two Sum\ntime_ms = 2000\nmemory_mb=256\n\n  tests =  12  \nchecker = exact\n";

#[test]
fn a_full_file_parses() {
    assert_eq!(
        parse(FULL),
        Ok(Limits { time_ms: 2000, memory_mb: 256, tests: 12, checker: Checker::Exact })
    );
}

#[test]
fn the_checker_defaults_to_tokens() {
    let l = parse("time_ms = 1000\nmemory_mb = 64\ntests = 3\n");
    assert_eq!(l.map(|l| l.checker), Ok(Checker::Tokens));
}

#[test]
fn a_float_checker_carries_its_tolerance() {
    let l = parse("time_ms = 1\nmemory_mb = 1\ntests = 1\nchecker = float:1e-6\n");
    assert_eq!(l.map(|l| l.checker), Ok(Checker::Float { eps: 1e-6 }));
}

#[test]
fn a_line_without_equals_names_its_line() {
    assert_eq!(parse("# limits\ntime_ms 2000\n"), Err(ConfigError::MissingEquals { line: 2 }));
}

#[test]
fn an_unknown_key_is_reported() {
    assert_eq!(parse("time = 5\n"), Err(ConfigError::UnknownKey { line: 1, key: "time".into() }));
}

#[test]
fn a_bad_number_keeps_the_raw_value() {
    assert_eq!(
        parse("time_ms = 2000\nmemory_mb = 256MB\n"),
        Err(ConfigError::BadNumber { line: 2, key: "memory_mb".into(), value: "256MB".into() })
    );
    assert_eq!(
        parse("tests = -3\n"),
        Err(ConfigError::BadNumber { line: 1, key: "tests".into(), value: "-3".into() })
    );
}

#[test]
fn an_unknown_checker_is_reported() {
    assert_eq!(parse("checker = fuzzy\n"), Err(ConfigError::UnknownChecker { line: 1, value: "fuzzy".into() }));
    assert_eq!(parse("checker = float:abc\n"), Err(ConfigError::UnknownChecker { line: 1, value: "float:abc".into() }));
}

#[test]
fn a_duplicate_key_is_reported() {
    assert_eq!(
        parse("time_ms = 1\nmemory_mb = 2\ntime_ms = 3\n"),
        Err(ConfigError::Duplicate { line: 3, key: "time_ms".into() })
    );
}

#[test]
fn the_first_missing_key_is_reported() {
    assert_eq!(parse("tests = 4\n"), Err(ConfigError::Missing { key: "time_ms" }));
    assert_eq!(parse("time_ms = 1\ntests = 4\n"), Err(ConfigError::Missing { key: "memory_mb" }));
}

#[test]
fn messages_speak_to_the_user() {
    let msg = |text: &str| parse(text).err().map(|e| e.to_string()).unwrap_or_default();
    assert_eq!(msg("time_ms 2000"), "line 1: expected key = value");
    assert_eq!(msg("\n\n\ntime = 1"), "line 4: unknown key \"time\"");
    assert_eq!(msg("time_ms = 1\nmemory_mb = 256MB"), "line 2: memory_mb is not a number: \"256MB\"");
    assert_eq!(msg("checker = fuzzy"), "line 1: unknown checker \"fuzzy\"");
    assert_eq!(msg("time_ms = 1\nmemory_mb = 1\ntime_ms = 2"), "line 3: time_ms appears twice");
    assert_eq!(msg("time_ms = 1"), "missing key: memory_mb");
}

#[test]
fn load_reads_a_real_file() {
    let l = load(Path::new("tests/data/two-sum.conf"));
    assert!(matches!(l, Ok(Limits { time_ms: 2000, memory_mb: 256, tests: 12, checker: Checker::Tokens })), "{l:?}");
}

#[test]
fn load_tells_the_two_failures_apart() {
    let missing = load(Path::new("tests/data/no-such.conf"));
    assert!(matches!(missing, Err(LoadError::Io(_))), "{missing:?}");
    let text = missing.err().map(|e| e.to_string()).unwrap_or_default();
    assert!(text.starts_with("cannot read"), "message was {text:?}");

    let bad = load(Path::new("Cargo.toml"));
    assert!(matches!(bad, Err(LoadError::Config(_))), "{bad:?}");
    let text = bad.err().map(|e| e.to_string()).unwrap_or_default();
    assert!(text.starts_with("bad limits file: line "), "message was {text:?}");
}
