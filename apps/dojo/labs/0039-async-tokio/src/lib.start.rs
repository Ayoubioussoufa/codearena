//! Lesson 39: async with tokio. Many waits, few threads.
//!
//! An async function returns a future: nothing runs until it's awaited or
//! spawned. tokio's runtime drives thousands of them on a few threads, as long
//! as none of them blocks.

#![allow(unused_imports)]
mod kit;
pub use kit::slow_checksum;

use std::sync::Arc;
use std::time::Duration;
use tokio::sync::Semaphore;
use tokio::task::JoinSet;

#[derive(Debug, Clone)]
pub struct Job {
    pub id: usize,
    /// How long the job waits (a stand-in for a network call or a container).
    pub millis: u64,
}

#[derive(Debug, PartialEq)]
pub enum Outcome {
    Done { id: usize },
    TimedOut { id: usize },
}

/// Runs every job (each is `tokio::time::sleep(millis)`), with at most `limit`
/// running at once (a Semaphore) and each one cut off after `per_job` (timeout).
/// Returns the outcomes sorted by id.
pub async fn run_all(jobs: Vec<Job>, limit: usize, per_job: Duration) -> Vec<Outcome> {
    todo!()
}

/// Two mirrors answer after `a.1` and `b.1` ms. Returns the name of the first
/// to answer; the other one is cancelled, not waited for. Use tokio::select!.
pub async fn fastest(a: (&'static str, u64), b: (&'static str, u64)) -> &'static str {
    todo!()
}

/// The checksum of every input, in order, computed with `slow_checksum`.
/// It's CPU work that blocks its thread: if it runs on the runtime's own
/// threads, every other task waits behind it. Run each with spawn_blocking.
pub async fn checksum_all(inputs: Vec<Vec<u8>>) -> Vec<u64> {
    todo!()
}
