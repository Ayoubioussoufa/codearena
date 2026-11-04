// The kit's tests. Don't edit them: make them pass.
use scanner::{Scanner, Tokens, longest};

fn inside(outer: &str, part: &str) -> bool {
    let (o, p) = (outer.as_ptr() as usize, part.as_ptr() as usize);
    p >= o && p + part.len() <= o + outer.len()
}

#[test]
fn longest_returns_one_of_its_inputs() {
    assert_eq!(longest("judge", "run"), "judge");
    assert_eq!(longest("ab", "cd"), "ab", "on a tie, the first");
}

#[test]
fn tokens_split_on_any_whitespace() {
    let t: Vec<&str> = Tokens::new(" 3\n14  15\t9 \n").collect();
    assert_eq!(t, ["3", "14", "15", "9"]);
    assert_eq!(Tokens::new("").count(), 0);
    assert_eq!(Tokens::new(" \n\t ").count(), 0);
}

#[test]
fn tokens_are_slices_of_the_input() {
    let input = String::from("alpha beta\ngamma");
    assert!(Tokens::new(&input).all(|t| inside(&input, t)), "a token was copied");
}

#[test]
fn the_scanner_reads_typed_values() {
    let mut sc = Scanner::new("3\n1 -2 3\nalice 2.5\n");
    let n: usize = sc.read().unwrap();
    assert_eq!(n, 3);
    assert_eq!(sc.vec::<i64>(n), Some(vec![1, -2, 3]));
    assert_eq!(sc.word(), Some("alice"));
    assert_eq!(sc.read::<f64>(), Some(2.5));
    assert_eq!(sc.read::<u32>(), None, "the input is used up");
}

#[test]
fn a_bad_token_reads_as_none() {
    assert_eq!(Scanner::new("x").read::<u32>(), None);
    assert_eq!(Scanner::new("1 2").vec::<u8>(3), None, "only two tokens");
    assert_eq!(Scanner::new("1 x 3").vec::<u8>(3), None, "x isn't a number");
}

#[test]
fn words_outlive_the_borrow_of_the_scanner() {
    let mut sc = Scanner::new("alice bob");
    let a = sc.word().unwrap();
    let b = sc.word().unwrap();
    assert_eq!((a, b), ("alice", "bob"));
}

#[test]
fn words_outlive_the_scanner_itself() {
    let input = String::from("alice bob");
    let first;
    {
        let mut sc = Scanner::new(&input);
        first = sc.word().unwrap();
    }
    assert_eq!(first, "alice");
    assert!(inside(&input, first));
}
