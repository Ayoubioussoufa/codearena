//! Lesson 28: lesson 1's wait-status decoder, in Rust.
//!
//! A wait status is the integer `waitpid` fills in. The low 7 bits hold the
//! signal that killed the child (0 if none killed it); bit 7 is the core-dump
//! flag; the next 8 bits hold the exit code when the child ended by itself.
//! Replace each `todo!()` with an expression. No `return` needed: a function's
//! last expression, without a semicolon, is its value.

/// True when the child ended by itself (no signal killed it).
pub fn exited(status: i32) -> bool {
    todo!()
}

/// The exit code (0–255). Only meaningful when `exited(status)`.
pub fn exit_code(status: i32) -> i32 {
    todo!()
}

/// The signal number that killed the child. Only meaningful when `!exited(status)`.
pub fn term_signal(status: i32) -> i32 {
    todo!()
}

/// What `run` prints: "exit N" or "signal S".
pub fn describe(status: i32) -> String {
    todo!()
}

/// What a shell's `$?` shows: the exit code, or 128 + the signal.
pub fn shell_code(status: i32) -> i32 {
    todo!()
}
