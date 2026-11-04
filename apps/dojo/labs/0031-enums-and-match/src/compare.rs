//! Given: lesson 30's comparator. The 1-based position of the first token that
//! differs (a missing or extra token counts), or None when the outputs match.
pub fn first_difference(expected: &str, actual: &str) -> Option<usize> {
    let mut e = expected.split_whitespace();
    let mut a = actual.split_whitespace();
    let mut n = 1;
    loop {
        match (e.next(), a.next()) {
            (None, None) => return None,
            (x, y) if x != y => return Some(n),
            _ => n += 1,
        }
    }
}
