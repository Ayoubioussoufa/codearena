import type { Lesson } from "../types";

export const lesson0041: Lesson = {
  slug: "0041-pyo3-extension",
  number: 41,
  track: "rust",
  title: "Rust inside Python: PyO3 and maturin",
  summary: "Ship your tokenizer as a Python module, release the GIL, and measure the speedup honestly.",
  minutes: 90,
  status: "ready",
  builds: "`import fasttok`: your lesson-40 tokenizer as a Python class, about 25 times faster than pure Python, GIL released",
  lab: { dir: "0041-pyo3-extension", writes: ["src/lib.rs", "src/bpe.rs"], check: "bash check.sh" },
  reference: "rust-python",
  warmup: [
    { lesson: "0040-bpe-tokenizer", question: 4 },
    { lesson: "0038-threads", question: 3 },
  ],
  words: ["extension module", "PyO3", "maturin", "the GIL", "cdylib", "wheel"],
  answers: [
    { id: "measure", label: "Section 4: your speedup, and why it isn't one number" },
    { id: "challenge", label: "Challenge: a wheel others can pip install (optional)" },
  ],
  quiz: [
    {
      prompt: "What does `maturin develop` do?",
      options: [
        "It builds the crate and installs it in the active virtualenv",
        "It uploads the crate to PyPI under the name in pyproject.toml",
        "It translates all the Rust code into an equivalent Python file",
        "It starts a server that reloads the module on each change",
      ],
      correct: 0,
      why: "`maturin develop` compiles the crate as a Python extension and installs it into the current virtualenv, so `import fasttok` works right away. `maturin build --release` produces a wheel file instead, and `maturin publish` uploads to PyPI.",
    },
    {
      prompt: "Why does `Cargo.toml` say `crate-type = [\"cdylib\"]`?",
      options: [
        "Python only accepts the code built by a C compiler",
        "cdylib makes Cargo skip the borrow checker, for more speed",
        "Python loads extensions as shared libraries with a C ABI",
        "It tells Cargo to produce a static executable to run",
      ],
      correct: 2,
      why: "CPython loads extension modules as shared libraries with a C ABI (a `.so` on Linux), and calls their init function. `cdylib` asks Cargo for exactly that kind of library. Nothing is translated: your Rust is compiled to machine code, as always.",
    },
    {
      prompt: "A method returns `Err(PyValueError::new_err(\"bad bytes\"))`. What does the Python caller see?",
      options: [
        "The method returns None, and the error is logged",
        "A ValueError, raised at the call, with that message",
        "A Rust panic, which kills the whole Python interpreter",
        "An Err object that callers must inspect by hand",
      ],
      correct: 1,
      why: "A `PyResult` that's `Err` becomes a raised Python exception of that type, so Python code handles it with an ordinary `try`/`except ValueError`. Errors stay values on the Rust side and become exceptions on the Python side.",
    },
    {
      prompt: "Why does `encode` wrap its work in `py.detach(|| …)`?",
      options: [
        "So the tokens it builds are freed by Python's garbage collector",
        "So PyO3 can convert its result into a Python list faster",
        "So other Python threads can run while the Rust code works",
        "So the work moves to a GPU, away from the interpreter",
      ],
      correct: 2,
      why: "CPython's GIL lets one thread run Python at a time, and an extension holds it by default. `detach` releases it for the closure, which mustn't touch Python objects. Your test proved it: with the GIL held, the other thread ran 0 times during encoding.",
    },
    {
      prompt: "Your test measured Rust about 25 times faster than the Python reference. What's the honest conclusion?",
      options: [
        "Rust is 25 times faster than Python for any work",
        "Python is too slow, so every service should be rewritten",
        "The gap comes only from releasing the GIL in encode",
        "Tight byte loops gain a lot; measure each case separately",
      ],
      correct: 3,
      why: "The gain comes from compiling a tight loop over bytes and integers, the work an interpreter is slowest at. Code that mostly calls into C libraries (NumPy, PyTorch) or waits on I/O gains far less. The GIL release didn't speed up this single-threaded timing at all. Measure the hot path, then decide.",
    },
  ],
};
