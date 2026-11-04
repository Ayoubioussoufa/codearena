//! Lesson 34: lifetimes. A contest input scanner that copies nothing.
//!
//! Two lifetime mistakes are planted here, and `bash check.sh` shows them one
//! at a time: `longest` doesn't compile, and once it does, the tests won't
//! compile against `word`'s signature. Fix both by saying, with a lifetime,
//! what each returned slice borrows from.

/// The Book's example: the longer of two strings (the first one on a tie).
pub fn longest(a: &str, b: &str) -> &str {
    if a.len() >= b.len() { a } else { b }
}

/// Whitespace-separated tokens, each one a slice of the input.
pub struct Tokens<'a> {
    rest: &'a str,
}

impl<'a> Tokens<'a> {
    pub fn new(input: &'a str) -> Self {
        Tokens { rest: input }
    }
}

impl<'a> Iterator for Tokens<'a> {
    type Item = &'a str;

    /// Skip whitespace, cut off one token, keep the rest for next time.
    fn next(&mut self) -> Option<Self::Item> {
        todo!()
    }
}

/// Reads typed values from contest input: `let n: usize = sc.read()?;`
pub struct Scanner<'a> {
    tokens: Tokens<'a>,
}

impl<'a> Scanner<'a> {
    pub fn new(input: &'a str) -> Self {
        todo!()
    }

    /// The next token parsed as T; None at the end or if it doesn't parse.
    pub fn read<T: std::str::FromStr>(&mut self) -> Option<T> {
        todo!()
    }

    /// The next token as text, a slice of the input. Its signature is wrong.
    pub fn word(&mut self) -> Option<&str> {
        todo!()
    }

    /// The next n tokens parsed as T; None if there aren't n, or one doesn't parse.
    pub fn vec<T: std::str::FromStr>(&mut self, n: usize) -> Option<Vec<T>> {
        todo!()
    }
}
