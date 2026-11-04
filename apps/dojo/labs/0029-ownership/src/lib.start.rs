//! Lesson 29: ownership.
//!
//! Part 1. The five functions below don't compile. Fix each one by changing
//! how it holds its data (borrow instead of move, & instead of a copy), never by
//! calling .clone(): the checker counts them. Run `bash check.sh`: it shows the
//! first error. Read it, fix it, run again.
//!
//! Part 2. Write `split_words`, the core of minishell's lexer.

/// "ls with 2 argument(s)" for ["ls", "-l", "/tmp"].
pub fn describe_command(argv: Vec<String>) -> String {
    let program = argv[0];
    format!("{program} with {} argument(s)", argv.len() - 1)
}

fn shout(s: String) -> String {
    s.to_uppercase()
}

/// "JUDGE (5 chars)" for "judge".
pub fn banner(title: String) -> String {
    let loud = shout(title);
    format!("{loud} ({} chars)", title.len())
}

/// (length of the longest word, number of words).
pub fn longest_and_count(words: Vec<String>) -> (usize, usize) {
    let mut longest = 0;
    for w in words {
        longest = longest.max(w.len());
    }
    (longest, words.len())
}

pub struct Job {
    pub id: u32,
    pub stdin: Option<String>,
}

/// How many bytes the job feeds its program: 0 when it has no stdin.
pub fn stdin_len(job: &Job) -> usize {
    match job.stdin {
        Some(s) => s.len(),
        None => 0,
    }
}

/// The first word of a command line, as a slice of the line itself: no copy.
pub fn first_word(line: &str) -> &str {
    let owned = line.trim().to_string();
    owned.split(' ').next().unwrap_or("")
}

/// Splits a command line into words, like a shell:
/// - spaces and tabs separate words; runs of them count once;
/// - '...' and "..." group text, quotes removed: `echo "a b"` gives ["echo", "a b"];
/// - quoted and plain text glue together: `a"b c"d` gives ["ab cd"];
/// - "" is an empty word: `a "" b` gives ["a", "", "b"];
/// - an unclosed quote runs to the end of the line.
pub fn split_words(line: &str) -> Vec<String> {
    todo!()
}
