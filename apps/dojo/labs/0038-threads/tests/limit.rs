// The kit's tests. One test alone in its file, so no other test's jobs run
// at the same time and skew the count.
use parallel::{Job, judge_parallel, judge_with_channel, max_concurrency, reset_concurrency};

#[test]
fn never_more_jobs_at_once_than_workers() {
    let jobs: Vec<Job> = (0..12).map(|id| Job { id, millis: 30, correct: true }).collect();

    reset_concurrency();
    judge_parallel(&jobs, 3);
    assert_eq!(max_concurrency(), 3, "judge_parallel with 3 workers ran {} jobs at once", max_concurrency());

    reset_concurrency();
    judge_with_channel(jobs, 3);
    assert_eq!(max_concurrency(), 3, "judge_with_channel with 3 workers ran {} jobs at once", max_concurrency());
}
