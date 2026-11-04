//! Lesson 38: threads without data races.
//!
//! `judge_one` (in work.rs, given) takes a while, like a container run. Your
//! job: judge many at once, safely. Three functions, three tools.

#![allow(unused_imports)]
mod work;
pub use work::{Job, Outcome, judge_one, max_concurrency, reset_concurrency};

use std::sync::{Arc, Mutex, mpsc};
use std::thread;

/// Judges every job with at most `workers` threads at once (0 means 1) and
/// returns the outcomes in the same order as `jobs`. Use `thread::scope`:
/// scoped threads may borrow `jobs`, because the scope waits for all of them.
pub fn judge_parallel(jobs: &[Job], workers: usize) -> Vec<Outcome> {
    todo!()
}

/// Sums the values with one thread per chunk of 1,000. It doesn't compile:
/// every thread wants `&mut total` at the same time, which is a data race, and
/// the compiler refuses it. Fix it without unsafe and without a lock: let each
/// thread return its own partial sum, and add them up after `join`.
pub fn total_parallel(values: &[u64]) -> u64 {
    let mut total = 0;
    thread::scope(|s| {
        for chunk in values.chunks(1000) {
            s.spawn(|| total += chunk.iter().sum::<u64>());
        }
    });
    total
}

/// A worker pool, as CodeArena's worker would run one: `workers` threads (0
/// means 1) started with `thread::spawn`. Those can't borrow (they might outlive
/// this function), so the jobs travel through an mpsc channel, the receiver is
/// shared with `Arc<Mutex<…>>`, and the outcomes come back through a second
/// channel. Returns them sorted by job id.
pub fn judge_with_channel(jobs: Vec<Job>, workers: usize) -> Vec<Outcome> {
    todo!()
}
