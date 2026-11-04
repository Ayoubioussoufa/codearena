//! Lesson 33: traits. One judge, many checkers.
//!
//! A problem says how its outputs are compared: byte for byte, by tokens, or as
//! numbers within a tolerance. Each way is a type; the trait is what they share.

/// What every checker can do.
pub trait Checker {
    /// True when `actual` is an acceptable answer for `expected`.
    fn check(&self, expected: &str, actual: &str) -> bool;

    /// A short name for logs: "exact", "tokens", "float(0.001)", "nocase(tokens)".
    fn name(&self) -> String;

    /// The 1-based numbers of the cases that fail. A default method: write its
    /// body once here, using `self.check`, and every checker gets it for free.
    fn failures(&self, cases: &[(&str, &str)]) -> Vec<usize> {
        todo!()
    }
}

/// Byte for byte: "5\n" and "5" differ.
pub struct Exact;

/// Lesson 9's rule: equal token sequences.
pub struct Tokens;

/// Like Tokens, but two tokens that both parse as f64 are equal when they're
/// within `eps` of each other, absolutely or relatively: |a - b| <= eps, or
/// |a - b| <= eps * |expected|. Other tokens compare exactly.
pub struct Float {
    pub eps: f64,
}

/// Wraps any checker and ignores ASCII case: IgnoreCase(Tokens) accepts "yes"
/// for "YES". Generic over the checker it wraps.
pub struct IgnoreCase<C>(pub C);

impl Checker for Exact {
    fn check(&self, expected: &str, actual: &str) -> bool {
        todo!()
    }
    fn name(&self) -> String {
        todo!()
    }
}

impl Checker for Tokens {
    fn check(&self, expected: &str, actual: &str) -> bool {
        todo!()
    }
    fn name(&self) -> String {
        todo!()
    }
}

impl Checker for Float {
    fn check(&self, expected: &str, actual: &str) -> bool {
        todo!()
    }
    fn name(&self) -> String {
        todo!()
    }
}

impl<C: Checker> Checker for IgnoreCase<C> {
    fn check(&self, expected: &str, actual: &str) -> bool {
        todo!()
    }
    fn name(&self) -> String {
        todo!()
    }
}

/// How many cases pass. Generic: one copy of this function is compiled per
/// checker type it's called with (static dispatch).
pub fn count_passed<C: Checker>(checker: &C, cases: &[(&str, &str)]) -> usize {
    todo!()
}

/// The checker a problem's config names, chosen at runtime (dynamic dispatch):
/// "exact", "tokens", "float:<eps>", "nocase:exact", "nocase:tokens".
/// Anything else, including a float with a bad number: None.
pub fn checker_for(name: &str) -> Option<Box<dyn Checker>> {
    todo!()
}
