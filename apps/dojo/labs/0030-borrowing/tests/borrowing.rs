// The kit's tests. Don't edit them: make them pass.
use borrowing::{append_eof, first_difference, same_tokens, token, tokens, trim_lines};

fn inside(outer: &str, part: &str) -> bool {
    let (o, p) = (outer.as_ptr() as usize, part.as_ptr() as usize);
    p >= o && p + part.len() <= o + outer.len()
}

#[test]
fn tokens_are_slices_of_the_input() {
    let out = String::from("  3 14\t15\n92\n");
    let t = tokens(&out);
    assert_eq!(t, ["3", "14", "15", "92"]);
    assert!(t.iter().all(|tok| inside(&out, tok)), "a token was copied instead of borrowed");
}

#[test]
fn same_tokens_ignores_whitespace_only() {
    assert!(same_tokens("5\n", "5"), "a missing final newline is still the right answer");
    assert!(same_tokens("1 2\n3\n", "1\t2   3"));
    assert!(!same_tokens("1.0", "1"), "tokens compare exactly");
    assert!(!same_tokens("YES", "yes"), "tokens compare exactly");
    assert!(!same_tokens("1 2", "1 2 3"), "an extra token is a difference");
}

#[test]
fn first_difference_counts_tokens_from_1() {
    assert_eq!(first_difference("1 2 3", "1 2 4"), Some(3));
    assert_eq!(first_difference("1 2 3", "1\n2\n3\n"), None);
    assert_eq!(first_difference("1 2", "1"), Some(2), "a missing token");
    assert_eq!(first_difference("1", "1 2"), Some(2), "an extra token");
    assert_eq!(first_difference("", ""), None);
}

#[test]
fn token_returns_a_slice_of_the_input() {
    let s = String::from("a bb ccc");
    let t = token(&s, 2);
    assert_eq!(t, Some("bb"));
    assert!(inside(&s, t.unwrap()), "token returned a copy");
    assert_eq!(token(&s, 4), None);
    assert_eq!(token(&s, 0), None, "positions start at 1");
}

#[test]
fn trim_lines_works_in_place() {
    let mut v: Vec<String> = ["a  ", "b\t", "", "  "].iter().map(|s| s.to_string()).collect();
    let buffer = v[0].as_ptr();
    trim_lines(&mut v);
    assert_eq!(v, ["a", "b"]);
    assert_eq!(v[0].as_ptr(), buffer, "the first line got a new buffer: trim it in place");
}

#[test]
fn append_eof_returns_the_first_length() {
    let mut v = vec!["abc".to_string()];
    assert_eq!(append_eof(&mut v), 3);
    assert_eq!(v, ["abc", "EOF"]);
}
