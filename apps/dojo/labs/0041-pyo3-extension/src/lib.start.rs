//! Lesson 41: your lesson-40 tokenizer, as a Python module.
//!
//! First copy your tokenizer next to this file:
//!     cp ../0040-bpe-tokenizer/src/lib.rs src/bpe.rs
//! Then expose it to Python as `fasttok.Tokenizer`, with:
//!     Tokenizer.train(text, vocab_size)  a static method returning a Tokenizer
//!     tok.encode(text) -> list[int]       releases the GIL while it works
//!     tok.decode(ids) -> str              ValueError if the bytes aren't UTF-8
//!     tok.merges -> list[tuple[int, int]] a read-only property
//!     len(tok) -> int                     256 + the number of merges
//!
//! PyO3 0.30 declares a module as an inline `mod` (https://pyo3.rs).

mod bpe;

#[pyo3::pymodule]
mod fasttok {
    use pyo3::exceptions::PyValueError;
    use pyo3::prelude::*;

    #[pyclass]
    struct Tokenizer {
        inner: crate::bpe::Tokenizer,
    }

    #[pymethods]
    impl Tokenizer {
        #[staticmethod]
        fn train(text: &str, vocab_size: usize) -> Self {
            todo!()
        }

        /// `py.detach(|| …)` releases the GIL for the closure, so other Python
        /// threads run while Rust works.
        fn encode(&self, py: Python<'_>, text: &str) -> Vec<u32> {
            todo!()
        }

        fn decode(&self, ids: Vec<u32>) -> PyResult<String> {
            todo!()
        }

        #[getter]
        fn merges(&self) -> Vec<(u32, u32)> {
            todo!()
        }

        fn __len__(&self) -> usize {
            todo!()
        }
    }
}
