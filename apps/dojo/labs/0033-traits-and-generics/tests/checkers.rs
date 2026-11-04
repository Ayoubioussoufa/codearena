// The kit's tests. Don't edit them: make them pass.
use checkers::{Checker, Exact, Float, IgnoreCase, Tokens, checker_for, count_passed};

#[test]
fn exact_compares_bytes() {
    assert!(Exact.check("5\n", "5\n"));
    assert!(!Exact.check("5\n", "5"), "a missing newline is a difference, byte for byte");
    assert_eq!(Exact.name(), "exact");
}

#[test]
fn tokens_ignore_whitespace() {
    assert!(Tokens.check("1 2\n3\n", "1\t2 3"));
    assert!(!Tokens.check("YES", "yes"));
    assert_eq!(Tokens.name(), "tokens");
}

#[test]
fn float_accepts_small_errors() {
    let f = Float { eps: 1e-6 };
    assert!(f.check("0.333333", "0.3333332"), "absolute error 2e-7");
    assert!(f.check("1000000", "1000000.5"), "relative error 5e-7");
    assert!(!f.check("1.0", "1.1"));
    assert!(f.check("3 x 2.5", "3.0000001 x 2.5"), "numbers within eps, words exact");
    assert!(!f.check("1 x", "1 y"), "a non-numeric token compares exactly");
    assert!(!f.check("1 2", "1"), "a missing token");
    assert_eq!(f.name(), "float(0.000001)");
}

#[test]
fn ignore_case_wraps_any_checker() {
    assert!(IgnoreCase(Tokens).check("YES\n", "yes"));
    assert!(!IgnoreCase(Exact).check("Yes", "yes "), "it wraps Exact, so the space still counts");
    assert!(IgnoreCase(Exact).check("Yes", "yES"));
    assert_eq!(IgnoreCase(Tokens).name(), "nocase(tokens)");
}

#[test]
fn failures_is_a_default_method() {
    let cases = [("1", "1"), ("2", "3"), ("4", " 4"), ("5", "6")];
    assert_eq!(Tokens.failures(&cases), vec![2, 4]);
    assert_eq!(Exact.failures(&cases), vec![2, 3, 4]);
}

#[test]
fn count_passed_works_with_any_checker() {
    let cases = [("YES", "yes"), ("1.0", "1.0000001"), ("a b", "a  b")];
    assert_eq!(count_passed(&Tokens, &cases), 1);
    assert_eq!(count_passed(&IgnoreCase(Tokens), &cases), 2);
    assert_eq!(count_passed(&Float { eps: 1e-3 }, &cases), 2);
}

#[test]
fn checker_for_chooses_at_runtime() {
    let name = |s: &str| checker_for(s).map(|c| c.name());
    assert_eq!(name("exact").as_deref(), Some("exact"));
    assert_eq!(name("tokens").as_deref(), Some("tokens"));
    assert_eq!(name("float:0.001").as_deref(), Some("float(0.001)"));
    assert_eq!(name("nocase:tokens").as_deref(), Some("nocase(tokens)"));
    assert_eq!(name("nocase:exact").as_deref(), Some("nocase(exact)"));
    assert!(checker_for("fuzzy").is_none());
    assert!(checker_for("float:abc").is_none());
}

#[test]
fn different_checkers_live_in_one_vec() {
    let all: Vec<Box<dyn Checker>> = vec![Box::new(Exact), Box::new(Tokens), Box::new(Float { eps: 0.5 })];
    let passing: Vec<String> = all.iter().filter(|c| c.check("1\n", "1.2")).map(|c| c.name()).collect();
    assert_eq!(passing, ["float(0.5)"]);
}
