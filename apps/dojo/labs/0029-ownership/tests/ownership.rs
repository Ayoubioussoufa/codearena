// The kit's tests. Don't edit them: make them pass.
use ownership::{Job, banner, describe_command, first_word, longest_and_count, split_words, stdin_len};

fn strings(v: &[&str]) -> Vec<String> {
    v.iter().map(|s| s.to_string()).collect()
}

#[test]
fn describe_command_borrows_the_program_name() {
    assert_eq!(describe_command(strings(&["ls", "-l", "/tmp"])), "ls with 2 argument(s)");
}

#[test]
fn banner_still_has_the_title_after_shouting() {
    assert_eq!(banner("judge".to_string()), "JUDGE (5 chars)");
}

#[test]
fn longest_and_count_reads_without_consuming() {
    assert_eq!(longest_and_count(strings(&["a", "hello", "abc"])), (5, 3));
}

#[test]
fn stdin_len_looks_inside_without_moving() {
    assert_eq!(stdin_len(&Job { id: 1, stdin: Some("abc".to_string()) }), 3);
    assert_eq!(stdin_len(&Job { id: 2, stdin: None }), 0);
}

#[test]
fn first_word_points_into_the_line() {
    let line = String::from("   run -t 500 ./a.out");
    let word = first_word(&line);
    assert_eq!(word, "run");
    let start = line.as_ptr() as usize;
    let at = word.as_ptr() as usize;
    assert!(at >= start && at < start + line.len(), "first_word returned a copy, not a slice of the line");
}

#[test]
fn split_words_on_spaces_and_tabs() {
    assert_eq!(split_words("ls   -l\t/tmp"), strings(&["ls", "-l", "/tmp"]));
    assert_eq!(split_words("   "), Vec::<String>::new());
    assert_eq!(split_words(""), Vec::<String>::new());
}

#[test]
fn split_words_keeps_quoted_text_together() {
    assert_eq!(split_words(r#"echo "hello  world" 'a b'"#), strings(&["echo", "hello  world", "a b"]));
    assert_eq!(split_words(r#"say "it's""#), strings(&["say", "it's"]));
}

#[test]
fn split_words_glues_quoted_and_plain_text() {
    assert_eq!(split_words(r#"a"b c"d e"#), strings(&["ab cd", "e"]));
}

#[test]
fn split_words_keeps_empty_quoted_words() {
    assert_eq!(split_words(r#"a "" b ''"#), strings(&["a", "", "b", ""]));
}

#[test]
fn split_words_runs_an_unclosed_quote_to_the_end() {
    assert_eq!(split_words(r#"say "hi there"#), strings(&["say", "hi there"]));
}
