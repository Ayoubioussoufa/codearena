// The kit's tests. Don't edit them: make them pass.
use verdicts::{Ending, RunFacts, TestVerdict, Verdict, judge, judge_test};

fn ran(ending: Ending, stdout: &str) -> RunFacts {
    RunFacts { ending, oom_killed: false, output_capped: false, time_ms: 10, stdout: stdout.to_string() }
}

#[test]
fn a_right_answer_passes_whatever_the_whitespace() {
    assert_eq!(judge_test(&ran(Ending::Exited(0), "5"), "5\n"), TestVerdict::Passed);
}

#[test]
fn a_wrong_token_is_a_wrong_answer() {
    assert_eq!(judge_test(&ran(Ending::Exited(0), "1 2 4"), "1 2 3"), TestVerdict::WrongAnswer { token: 3 });
}

#[test]
fn a_crash_after_the_right_answer_is_a_runtime_error() {
    let facts = ran(Ending::Signaled(11), "5\n");
    assert_eq!(judge_test(&facts, "5\n"), TestVerdict::RuntimeError(Ending::Signaled(11)));
}

#[test]
fn a_non_zero_exit_is_a_runtime_error() {
    assert_eq!(judge_test(&ran(Ending::Exited(3), "5"), "5"), TestVerdict::RuntimeError(Ending::Exited(3)));
}

#[test]
fn the_deadline_beats_everything() {
    let mut facts = ran(Ending::TimedOut, "");
    facts.oom_killed = true;
    facts.output_capped = true;
    assert_eq!(judge_test(&facts, "5"), TestVerdict::TimeLimit);
}

#[test]
fn memory_comes_before_output_and_the_ending() {
    let mut facts = ran(Ending::Signaled(9), "");
    facts.oom_killed = true;
    facts.output_capped = true;
    assert_eq!(judge_test(&facts, "5"), TestVerdict::MemoryLimit);
}

#[test]
fn the_output_cap_comes_before_the_ending() {
    let mut facts = ran(Ending::Signaled(25), "yyyy");
    facts.output_capped = true;
    assert_eq!(judge_test(&facts, "5"), TestVerdict::OutputLimit);
}

#[test]
fn judge_stops_at_the_first_failure() {
    let results = [
        (ran(Ending::Exited(0), "1"), "1"),
        (ran(Ending::Exited(0), "7"), "2"),
        (ran(Ending::TimedOut, ""), "3"),
    ];
    assert_eq!(judge(&results), Some(Verdict::Failed { test: 2, why: TestVerdict::WrongAnswer { token: 1 } }));
}

#[test]
fn accepted_reports_the_slowest_test() {
    let mut results = vec![
        (ran(Ending::Exited(0), "1"), "1"),
        (ran(Ending::Exited(0), "2"), "2"),
        (ran(Ending::Exited(0), "3"), "3"),
    ];
    results[0].0.time_ms = 12;
    results[1].0.time_ms = 31;
    results[2].0.time_ms = 20;
    assert_eq!(judge(&results), Some(Verdict::Accepted { max_time_ms: 31 }));
}

#[test]
fn no_tests_means_no_verdict() {
    assert_eq!(judge(&[]), None);
}

#[test]
fn codes_are_the_short_names() {
    let f = |why| Verdict::Failed { test: 1, why };
    assert_eq!(Verdict::Accepted { max_time_ms: 5 }.code(), "AC");
    assert_eq!(f(TestVerdict::WrongAnswer { token: 1 }).code(), "WA");
    assert_eq!(f(TestVerdict::TimeLimit).code(), "TLE");
    assert_eq!(f(TestVerdict::MemoryLimit).code(), "MLE");
    assert_eq!(f(TestVerdict::OutputLimit).code(), "OLE");
    assert_eq!(f(TestVerdict::RuntimeError(Ending::Exited(1))).code(), "RE");
}

#[test]
fn describe_speaks_to_the_user() {
    assert_eq!(Verdict::Accepted { max_time_ms: 120 }.describe(), "Accepted, 120 ms");
    let wa = Verdict::Failed { test: 3, why: TestVerdict::WrongAnswer { token: 2 } };
    assert_eq!(wa.describe(), "Wrong Answer on test 3, token 2");
    let segv = Verdict::Failed { test: 1, why: TestVerdict::RuntimeError(Ending::Signaled(11)) };
    assert_eq!(segv.describe(), "Runtime Error on test 1: signal 11");
    let exit = Verdict::Failed { test: 2, why: TestVerdict::RuntimeError(Ending::Exited(3)) };
    assert_eq!(exit.describe(), "Runtime Error on test 2: exit 3");
    assert_eq!(Verdict::Failed { test: 4, why: TestVerdict::TimeLimit }.describe(), "Time Limit Exceeded on test 4");
    assert_eq!(Verdict::Failed { test: 2, why: TestVerdict::MemoryLimit }.describe(), "Memory Limit Exceeded on test 2");
    assert_eq!(Verdict::Failed { test: 5, why: TestVerdict::OutputLimit }.describe(), "Output Limit Exceeded on test 5");
}
