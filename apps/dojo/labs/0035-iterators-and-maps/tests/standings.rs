// The kit's tests. Don't edit them: make them pass.
use standings::{Row, Submission, acceptance_rate, count_where, first_solvers, standings, top};

fn sub(team: &str, problem: char, minute: u32, accepted: bool) -> Submission<'_> {
    Submission { team, problem, minute, accepted }
}

fn row(team: &str, solved: u32, penalty: u32) -> Row {
    Row { team: team.to_string(), solved, penalty }
}

#[test]
fn an_accepted_run_scores_its_minute() {
    assert_eq!(standings(&[sub("rabat", 'A', 17, true)]), [row("rabat", 1, 17)]);
}

#[test]
fn each_rejection_before_acceptance_costs_20() {
    let subs = [sub("rabat", 'A', 10, false), sub("rabat", 'A', 15, false), sub("rabat", 'A', 30, true)];
    assert_eq!(standings(&subs), [row("rabat", 1, 30 + 2 * 20)]);
}

#[test]
fn rejections_on_unsolved_problems_cost_nothing() {
    let subs = [sub("fes", 'B', 5, false), sub("fes", 'B', 9, false), sub("fes", 'A', 40, true)];
    assert_eq!(standings(&subs), [row("fes", 1, 40)]);
}

#[test]
fn runs_after_acceptance_are_ignored() {
    let subs = [sub("oujda", 'C', 20, true), sub("oujda", 'C', 25, false), sub("oujda", 'C', 50, true)];
    assert_eq!(standings(&subs), [row("oujda", 1, 20)]);
}

#[test]
fn teams_rank_by_solved_then_penalty_then_name() {
    let subs = [
        sub("casa", 'A', 30, true),
        sub("tanger", 'A', 10, true),
        sub("agadir", 'A', 30, true),
        sub("tanger", 'B', 50, false),
        sub("casa", 'B', 60, true),
        sub("zero", 'A', 70, false),
    ];
    assert_eq!(
        standings(&subs),
        [row("casa", 2, 90), row("tanger", 1, 10), row("agadir", 1, 30), row("zero", 0, 0)]
    );
}

#[test]
fn first_blood_goes_to_the_earliest_accepted_run() {
    let subs = [
        sub("casa", 'A', 30, true),
        sub("rabat", 'B', 12, false),
        sub("fes", 'A', 25, true),
        sub("rabat", 'A', 25, true),
        sub("casa", 'B', 40, true),
    ];
    let first = first_solvers(&subs);
    assert_eq!(first.into_iter().collect::<Vec<_>>(), [('A', "fes"), ('B', "casa")]);
}

#[test]
fn acceptance_rate_per_problem() {
    let subs = [sub("a", 'A', 1, false), sub("b", 'A', 2, true), sub("c", 'A', 3, false), sub("d", 'A', 4, true)];
    assert_eq!(acceptance_rate(&subs, 'A'), Some(0.5));
    assert_eq!(acceptance_rate(&subs, 'Z'), None, "nobody tried Z");
}

#[test]
fn count_where_takes_any_closure() {
    let subs = [sub("a", 'A', 10, true), sub("b", 'B', 70, false), sub("c", 'A', 90, true)];
    assert_eq!(count_where(&subs, |s| s.accepted), 2);
    let late = 60;
    assert_eq!(count_where(&subs, |s| s.minute > late), 2, "the closure captures `late`");
    let team = String::from("b");
    assert_eq!(count_where(&subs, |s| s.team == team), 1, "it captures a String by reference");
}

#[test]
fn top_returns_the_first_names() {
    let rows = [row("casa", 2, 90), row("tanger", 1, 10), row("agadir", 1, 30)];
    assert_eq!(top(&rows, 2), ["casa", "tanger"]);
    assert_eq!(top(&rows, 10), ["casa", "tanger", "agadir"], "fewer rows than asked");
}
