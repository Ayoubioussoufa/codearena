//! Lesson 35: iterators, closures and maps. ICPC standings from raw submissions.
//!
//! ICPC rules (as regional rulebooks state them): rank by problems solved, then
//! by penalty minutes, lower first. A solved problem costs the minute of its
//! first accepted run plus 20 for each rejected run before it. Rejected runs
//! on a problem never solved cost nothing; runs after the acceptance are
//! ignored. Equal teams are listed by name, so the output is deterministic.
//!
//! Try to write each function as iterator chains, with as few `for` loops as
//! you can. Loops aren't wrong; the point today is fluency with the adaptors.

#[allow(unused_imports)]
use std::collections::{BTreeMap, HashMap};

#[derive(Debug, Clone, Copy)]
pub struct Submission<'a> {
    pub team: &'a str,
    pub problem: char,
    pub minute: u32,
    pub accepted: bool,
}

#[derive(Debug, PartialEq)]
pub struct Row {
    pub team: String,
    pub solved: u32,
    pub penalty: u32,
}

/// Every team that submitted at least once, ranked. Submissions come in time
/// order (equal minutes keep their order).
pub fn standings(subs: &[Submission]) -> Vec<Row> {
    todo!()
}

/// For each problem anyone solved, the team that solved it first ("first
/// blood"): the earliest accepted run, the first in the list on a tie.
/// A BTreeMap keeps the problems in order.
pub fn first_solvers<'a>(subs: &[Submission<'a>]) -> BTreeMap<char, &'a str> {
    todo!()
}

/// Accepted runs divided by all runs on that problem; None if nobody tried it.
pub fn acceptance_rate(subs: &[Submission], problem: char) -> Option<f64> {
    todo!()
}

/// How many submissions satisfy `pred`. The bound says pred may be called many
/// times and only reads what it captured.
pub fn count_where<F: Fn(&Submission) -> bool>(subs: &[Submission], pred: F) -> usize {
    todo!()
}

/// The names of the first n rows.
pub fn top(rows: &[Row], n: usize) -> Vec<&str> {
    todo!()
}
