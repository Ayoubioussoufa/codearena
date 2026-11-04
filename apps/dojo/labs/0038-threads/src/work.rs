//! Given: a stand-in for judging one submission. It sleeps for the job's
//! duration (as a container run would keep a worker busy) and records how many
//! jobs were running at the same moment, so the tests can check your limit.

use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::Duration;

static RUNNING: AtomicUsize = AtomicUsize::new(0);
static MAX_SEEN: AtomicUsize = AtomicUsize::new(0);

#[derive(Debug, Clone)]
pub struct Job {
    pub id: usize,
    pub millis: u64,
    pub correct: bool,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Outcome {
    pub id: usize,
    pub verdict: &'static str,
}

pub fn judge_one(job: &Job) -> Outcome {
    let now = RUNNING.fetch_add(1, Ordering::SeqCst) + 1;
    MAX_SEEN.fetch_max(now, Ordering::SeqCst);
    std::thread::sleep(Duration::from_millis(job.millis));
    RUNNING.fetch_sub(1, Ordering::SeqCst);
    Outcome { id: job.id, verdict: if job.correct { "AC" } else { "WA" } }
}

/// The most jobs that were ever running at once, since the last reset.
pub fn max_concurrency() -> usize {
    MAX_SEEN.load(Ordering::SeqCst)
}

pub fn reset_concurrency() {
    MAX_SEEN.store(0, Ordering::SeqCst);
}
