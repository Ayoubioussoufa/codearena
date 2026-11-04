// The kit's tests. Don't edit them: make them pass. With start_paused, tokio's
// clock is virtual: sleeps finish instantly, and elapsed time is exact.
use asyncjudge::{Job, Outcome, checksum_all, fastest, run_all, slow_checksum};
use std::time::Duration;
use tokio::time::Instant;

fn jobs(n: usize, millis: u64) -> Vec<Job> {
    (0..n).map(|id| Job { id, millis }).collect()
}

#[tokio::test(start_paused = true)]
async fn a_hundred_jobs_ten_at_a_time() {
    let start = Instant::now();
    let out = run_all(jobs(100, 1000), 10, Duration::from_secs(5)).await;
    assert_eq!(out, (0..100).map(|id| Outcome::Done { id }).collect::<Vec<_>>());
    assert_eq!(start.elapsed(), Duration::from_secs(10), "100 one-second jobs, 10 at a time, take 10 s");
}

#[tokio::test(start_paused = true)]
async fn the_limit_is_respected() {
    let start = Instant::now();
    run_all(jobs(6, 1000), 2, Duration::from_secs(5)).await;
    assert_eq!(start.elapsed(), Duration::from_secs(3), "6 jobs, 2 at a time: 3 rounds of 1 s");
}

#[tokio::test(start_paused = true)]
async fn slow_jobs_time_out() {
    let mut js = jobs(3, 1000);
    js[1].millis = 9000;
    let start = Instant::now();
    let out = run_all(js, 3, Duration::from_secs(2)).await;
    assert_eq!(out, [Outcome::Done { id: 0 }, Outcome::TimedOut { id: 1 }, Outcome::Done { id: 2 }]);
    assert_eq!(start.elapsed(), Duration::from_secs(2), "nobody waits for the 9 s job");
}

#[tokio::test(start_paused = true)]
async fn the_fastest_mirror_wins_and_the_other_is_dropped() {
    let start = Instant::now();
    assert_eq!(fastest(("casablanca", 300), ("rabat", 120)).await, "rabat");
    assert_eq!(start.elapsed(), Duration::from_millis(120), "the slower mirror was waited for");
    assert_eq!(fastest(("casablanca", 50), ("rabat", 120)).await, "casablanca");
}

#[tokio::test]
async fn heavy_work_does_not_block_other_tasks() {
    // tokio::test runs on one thread: a blocked thread blocks everything.
    let start = std::time::Instant::now();
    let ticker = tokio::spawn(async {
        tokio::time::sleep(Duration::from_millis(50)).await;
        std::time::Instant::now()
    });
    let inputs: Vec<Vec<u8>> = (0..4u8).map(|i| vec![i; 100]).collect();
    let sums = checksum_all(inputs.clone()).await;
    let ticked = ticker.await.unwrap() - start;
    assert_eq!(sums, inputs.iter().map(|b| slow_checksum(b)).collect::<Vec<_>>());
    assert!(ticked < Duration::from_millis(250), "a 50 ms timer fired after {ticked:?}: the heavy work blocked the runtime");
    assert!(start.elapsed() < Duration::from_millis(2200), "the checks ran one after another");
}
