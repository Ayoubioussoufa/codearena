//! Lesson 40: byte-level BPE, the tokenizer algorithm behind GPT-style models.
//!
//! Tokens are numbers. 0–255 are the raw bytes; each merge learned during
//! training adds one new token, 256, 257, …, standing for a pair of tokens.
//!
//! Training, on the bytes of a text:
//!   1. count every adjacent pair of tokens;
//!   2. take the most frequent pair; on a tie, the smallest pair, comparing
//!      (first, second) as numbers. Stop if no pair occurs at least twice;
//!   3. replace its occurrences, left to right and without overlap, with the
//!      next new token, and record the merge;
//!   4. repeat until the vocabulary has `vocab_size` tokens.
//! On "aaabdaaabac" this learns (a, a), then (a, b), then the pair of those two:
//! exactly the textbook example.
//!
//! Encoding new text replays the merges: while some adjacent pair has been
//! learned, merge the pair that was learned earliest, everywhere it occurs.

#![allow(unused_imports)]
use std::collections::HashMap;

pub type Pair = (u32, u32);

pub struct Tokenizer {
    /// merges[i] is the pair that token 256 + i stands for.
    merges: Vec<Pair>,
}

/// Replaces each non-overlapping occurrence of `pair`, left to right, with `new`.
pub fn merge(ids: &[u32], pair: Pair, new: u32) -> Vec<u32> {
    todo!()
}

/// How many times each adjacent pair occurs in `ids`.
pub fn pair_counts(ids: &[u32]) -> HashMap<Pair, usize> {
    todo!()
}

impl Tokenizer {
    /// Learns at most `vocab_size - 256` merges from `text` (none if vocab_size <= 256).
    pub fn train(text: &str, vocab_size: usize) -> Tokenizer {
        todo!()
    }

    pub fn merges(&self) -> &[Pair] {
        &self.merges
    }

    /// The tokens of `text`: its bytes, with the learned merges applied in the
    /// order they were learned.
    pub fn encode(&self, text: &str) -> Vec<u32> {
        todo!()
    }

    /// The bytes a token stands for: itself for 0–255, its pair's bytes otherwise.
    pub fn token_bytes(&self, id: u32) -> Vec<u8> {
        todo!()
    }

    /// The bytes of a sequence of tokens. decode(encode(t)) == t.as_bytes().
    pub fn decode(&self, ids: &[u32]) -> Vec<u8> {
        todo!()
    }
}
