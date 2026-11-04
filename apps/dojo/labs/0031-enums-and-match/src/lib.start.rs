//! Lesson 31: lesson 9's verdicts as Rust types.
//!
//! The types are given. Write the three functions and the two methods. Every
//! decision is a `match`; the compiler will tell you when one forgets a case.

mod compare;
use compare::first_difference;

/// How the program ended, as the runner saw it.
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Ending {
    /// It called exit, with this code.
    Exited(i32),
    /// A signal killed it.
    Signaled(i32),
    /// The runner's deadline stopped it (lesson 2).
    TimedOut,
}

/// What the runner reports for one test.
#[derive(Debug)]
pub struct RunFacts {
    pub ending: Ending,
    /// The cgroup's OOM killer stopped it (lessons 6 and 8).
    pub oom_killed: bool,
    /// It printed past the output cap (lesson 3).
    pub output_capped: bool,
    pub time_ms: u64,
    pub stdout: String,
}

/// The outcome of one test.
#[derive(Debug, PartialEq)]
pub enum TestVerdict {
    Passed,
    /// The 1-based position of the first token that differs.
    WrongAnswer { token: usize },
    TimeLimit,
    MemoryLimit,
    OutputLimit,
    /// A signal, or a non-zero exit code.
    RuntimeError(Ending),
}

/// The outcome of a submission.
#[derive(Debug, PartialEq)]
pub enum Verdict {
    /// Every test passed; the slowest one took this long.
    Accepted { max_time_ms: u64 },
    /// `test` is 1-based: the first test that didn't pass, and why.
    Failed { test: usize, why: TestVerdict },
}

/// Lesson 9's order: time, memory, output, how it ended, and only then the output.
pub fn judge_test(facts: &RunFacts, expected: &str) -> TestVerdict {
    todo!()
}

/// Runs through the tests in order and stops at the first that doesn't pass.
/// Each item is (what the runner saw, the expected output). No tests: None,
/// because a problem with no tests can't accept anything.
pub fn judge(results: &[(RunFacts, &str)]) -> Option<Verdict> {
    todo!()
}

impl Verdict {
    /// "AC", "WA", "TLE", "MLE", "OLE" or "RE".
    pub fn code(&self) -> &'static str {
        todo!()
    }

    /// For the user: "Accepted, 120 ms", "Wrong Answer on test 3, token 2",
    /// "Runtime Error on test 1: signal 11" or "...: exit 3",
    /// "Time Limit Exceeded on test 4", "Memory Limit Exceeded on test 2",
    /// "Output Limit Exceeded on test 5".
    pub fn describe(&self) -> String {
        todo!()
    }
}
