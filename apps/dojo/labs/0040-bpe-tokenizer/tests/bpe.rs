// The kit's tests. Don't edit them: make them pass.
use bpe::{Tokenizer, merge, pair_counts};

const A: u32 = b'a' as u32;
const B: u32 = b'b' as u32;
const C: u32 = b'c' as u32;
const D: u32 = b'd' as u32;

#[test]
fn merge_replaces_without_overlap() {
    assert_eq!(merge(&[A, A, A, B], (A, A), 256), [256, A, B], "aaa holds one aa, then an a");
    assert_eq!(merge(&[A, B, A, B], (A, B), 300), [300, 300]);
    assert_eq!(merge(&[A], (A, A), 256), [A]);
    assert_eq!(merge(&[], (A, A), 256), Vec::<u32>::new());
}

#[test]
fn pair_counts_counts_every_adjacent_pair() {
    let counts = pair_counts(&[A, A, A, B]);
    assert_eq!(counts.get(&(A, A)), Some(&2), "overlapping pairs are counted");
    assert_eq!(counts.get(&(A, B)), Some(&1));
    assert_eq!(counts.len(), 2);
    assert!(pair_counts(&[A]).is_empty());
}

#[test]
fn training_reproduces_the_textbook_example() {
    let t = Tokenizer::train("aaabdaaabac", 1000);
    assert_eq!(t.merges(), [(A, A), (A, B), (256, 257)], "aa, then ab, then (aa)(ab); then no pair repeats");
    assert_eq!(t.encode("aaabdaaabac"), [258, D, 258, A, C], "XdXac");
}

#[test]
fn the_vocabulary_size_caps_the_merges() {
    assert_eq!(Tokenizer::train("aaabdaaabac", 257).merges(), [(A, A)]);
    assert!(Tokenizer::train("aaabdaaabac", 256).merges().is_empty());
}

#[test]
fn encoding_applies_merges_in_the_order_learned() {
    let t = Tokenizer::train("aaabdaaabac", 1000);
    assert_eq!(t.encode("aaab"), [258], "aa first, then ab, then the pair of them");
    assert_eq!(t.encode("ba"), [B, A], "ba was never learned");
    assert_eq!(t.encode("xyz"), [120, 121, 122]);
    assert_eq!(t.encode(""), Vec::<u32>::new());
}

#[test]
fn tokens_stand_for_bytes() {
    let t = Tokenizer::train("aaabdaaabac", 1000);
    assert_eq!(t.token_bytes(A), b"a");
    assert_eq!(t.token_bytes(256), b"aa");
    assert_eq!(t.token_bytes(258), b"aaab");
}

#[test]
fn decode_inverts_encode_even_for_unicode() {
    let corpus = std::fs::read_to_string("tests/data/corpus.txt").unwrap();
    let t = Tokenizer::train(&corpus, 400);
    for text in [corpus.as_str(), "café, naïve, 🦀 crab", "", "judge judge judge"] {
        assert_eq!(t.decode(&t.encode(text)), text.as_bytes(), "round trip of {text:?}");
    }
}

#[test]
fn a_trained_tokenizer_compresses_its_corpus() {
    let corpus = std::fs::read_to_string("tests/data/corpus.txt").unwrap();
    let t = Tokenizer::train(&corpus, 400);
    let ids = t.encode(&corpus);
    let ratio = ids.len() as f64 / corpus.len() as f64;
    assert_eq!(t.merges().len(), 144, "400 tokens: 256 bytes plus 144 merges");
    assert!(ratio < 0.5, "{} tokens for {} bytes: ratio {ratio:.2}, expected under 0.5", ids.len(), corpus.len());
}
