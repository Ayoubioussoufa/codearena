//! Lesson 32: errors as values. A problem's limits file, parsed into types.
//!
//! The format, one `key = value` per line; blank lines and `#` comments ignored:
//!     time_ms = 2000          required, a whole number
//!     memory_mb = 256         required, a whole number
//!     tests = 12              required, a whole number
//!     checker = tokens        optional: tokens (the default), exact, or float:<eps>
//!
//! Rules of this lab: no unwrap(), no expect(), no panics. Every failure is a
//! value the caller can read. Lines are numbered from 1.

use std::fmt;
use std::path::Path;

#[derive(Debug, PartialEq)]
pub enum Checker {
    Tokens,
    Exact,
    Float { eps: f64 },
}

#[derive(Debug, PartialEq)]
pub struct Limits {
    pub time_ms: u64,
    pub memory_mb: u64,
    pub tests: u32,
    pub checker: Checker,
}

#[derive(Debug, PartialEq)]
pub enum ConfigError {
    /// A line that isn't blank or a comment, with no `=`.
    MissingEquals { line: usize },
    UnknownKey { line: usize, key: String },
    BadNumber { line: usize, key: String, value: String },
    UnknownChecker { line: usize, value: String },
    Duplicate { line: usize, key: String },
    /// A required key never appeared. Report the first one, in the order above.
    Missing { key: &'static str },
}

/// Reading a file can fail in two different ways: the file, or its contents.
#[derive(Debug)]
pub enum LoadError {
    Io(std::io::Error),
    Config(ConfigError),
}

/// The messages a user sees:
///   "line 1: expected key = value"
///   "line 4: unknown key \"time\""
///   "line 2: memory_mb is not a number: \"256MB\""
///   "line 5: unknown checker \"fuzzy\""
///   "line 3: time_ms appears twice"
///   "missing key: memory_mb"
impl fmt::Display for ConfigError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        todo!()
    }
}

impl std::error::Error for ConfigError {}

/// "cannot read <the io error>" or "bad limits file: <the config error>".
impl fmt::Display for LoadError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        todo!()
    }
}

/// These two let `?` turn either error into a LoadError by itself.
impl From<std::io::Error> for LoadError {
    fn from(e: std::io::Error) -> Self {
        todo!()
    }
}

impl From<ConfigError> for LoadError {
    fn from(e: ConfigError) -> Self {
        todo!()
    }
}

pub fn parse(text: &str) -> Result<Limits, ConfigError> {
    todo!()
}

/// Reads the file, then parses it. Two `?`s, one per way to fail.
pub fn load(path: &Path) -> Result<Limits, LoadError> {
    todo!()
}
