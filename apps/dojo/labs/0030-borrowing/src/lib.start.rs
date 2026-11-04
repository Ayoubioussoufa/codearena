//! Lesson 30: borrowing. Lesson 9's output comparator, in Rust, with zero copies.
//!
//! Every function here borrows its input. The ones returning &str must return a
//! slice of what they were given, never a new String: the tests check where the
//! returned bytes live.

/// The whitespace-separated tokens of `s`, as slices of `s`.
pub fn tokens(s: &str) -> Vec<&str> {
    todo!()
}

/// Lesson 9's rule: equal when the token sequences are equal. "5\n" and "5"
/// are the same answer; "1.0" and "1" aren't, nor are "YES" and "yes".
pub fn same_tokens(expected: &str, actual: &str) -> bool {
    todo!()
}

/// The 1-based position of the first token that differs (a missing or an
/// extra token counts), or None when the outputs match.
pub fn first_difference(expected: &str, actual: &str) -> Option<usize> {
    todo!()
}

/// The n-th token of `s` (1-based), as a slice of `s`; None if there isn't one.
pub fn token(s: &str, n: usize) -> Option<&str> {
    todo!()
}

/// For showing a diff: trims trailing whitespace off each line, in place (no new
/// Strings), then removes empty lines at the end.
pub fn trim_lines(lines: &mut Vec<String>) {
    todo!()
}

/// Appends an "EOF" line and returns the length of the first line.
/// This one doesn't compile: fix it without .clone(), and read why first.
pub fn append_eof(lines: &mut Vec<String>) -> usize {
    let first = &lines[0];
    lines.push("EOF".to_string());
    first.len()
}
