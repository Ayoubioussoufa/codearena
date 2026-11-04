// The kit's tests. Don't edit them: make them pass.
use parallel::{Job, Outcome, judge_parallel, judge_with_channel, total_parallel};
use std::time::{Duration, Instant};

fn jobs(n: usize, millis: u64) -> Vec<Job> {
    (0..n).map(|id| Job { id, millis, correct: id % 3 != 0 }).collect()
}

fn expected(n: usize) -> Vec<Outcome> {
    (0..n).map(|id| Outcome { id, verdict: if id % 3 != 0 { "AC" } else { "WA" } }).collect()
}

#[test]
fn total_parallel_adds_every_chunk() {
    let values: Vec<u64> = (1..=100_000).collect();
    assert_eq!(total_parallel(&values), 100_000 * 100_001 / 2);
    assert_eq!(total_parallel(&[]), 0);
}

#[test]
fn judge_parallel_keeps_the_input_order() {
    let mut js = jobs(10, 5);
    js.reverse();
    let got = judge_parallel(&js, 3);
    let ids: Vec<usize> = got.iter().map(|o| o.id).collect();
    assert_eq!(ids, (0..10).rev().collect::<Vec<_>>(), "outcome i belongs to job i");
}

#[test]
fn judge_parallel_runs_jobs_at_the_same_time() {
    let start = Instant::now();
    let got = judge_parallel(&jobs(8, 100), 4);
    let took = start.elapsed();
    assert_eq!(got, expected(8));
    assert!(took < Duration::from_millis(450), "8 jobs of 100 ms on 4 workers took {took:?}: about 200 ms is the goal, 800 ms is sequential");
}

#[test]
fn zero_workers_means_one() {
    assert_eq!(judge_parallel(&jobs(3, 1), 0), expected(3));
    assert_eq!(judge_with_channel(jobs(3, 1), 0), expected(3));
}

#[test]
fn the_channel_pool_returns_every_outcome_by_id() {
    let mut js = jobs(12, 10);
    js.reverse();
    assert_eq!(judge_with_channel(js, 4), expected(12));
}

#[test]
fn the_channel_pool_runs_jobs_at_the_same_time() {
    let start = Instant::now();
    let got = judge_with_channel(jobs(8, 100), 4);
    let took = start.elapsed();
    assert_eq!(got, expected(8));
    assert!(took < Duration::from_millis(450), "took {took:?}: about 200 ms is the goal");
}
