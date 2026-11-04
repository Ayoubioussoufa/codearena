# Labs

One folder per lesson (`/courses` in the dojo). Each holds a **kit**: test programs, starter
files when needed, and a `check.sh` that grades your work. You write the files the lesson asks
for; they're git-ignored, so your attempts stay yours and never land in a commit.

```bash
cd apps/dojo/labs/<lesson>
bash check.sh        # build and grade
```

Checkers are tested against a reference solution that is never committed.

## The Rust labs (lessons 28–42)

Each is a Cargo project. You write the files the lesson names (usually `src/lib.rs` or
`src/main.rs`, started from the `*.start.rs` next to it); the kit's tests live in `tests/`.
`check.sh` compiles, shows only the first compiler error if there is one, then prints one line
per test. What they need:

- **All of them:** a Rust toolchain from [rustup](https://rustup.rs) (lesson 28, step 1) and `cc`,
  which the C labs already use. The first run of a lab with dependencies downloads them.
- **36 and 37** also compile small C test programs; **36** needs `pgrep` (`sudo apt install procps`).
- **41 and 42** build a Python module: they need `python3-venv` (`sudo apt install python3-venv`).
  The first run creates `.venv/` in the lab and installs maturin into it.
- **42** runs `cargo fmt --check` and `cargo clippy`, which rustup's default profile installs.

Every checker was run against a reference solution (it passes) and the starter (it fails) with
rustc 1.99.1 in the `rust:1.99.1-slim-trixie` image, with tokio 1.54, PyO3 0.30, maturin 1.16 and
rayon 1.12.
