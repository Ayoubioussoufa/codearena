/**
 * Drills for the Rust track, lessons 28 to 42. Every behaviour a drill
 * states was checked with rustc 1.99.1 (rust:1.99.1-slim-trixie).
 */
import type { Rng } from "../engine/rng";
import { choice, numeric, text } from "../engine/helpers";
import { type Drill, lessonRef, pickFrom } from "./drill-kit";

/* ── Lesson 28: the basics ── */

const L28 = lessonRef("0028-cargo-and-the-compiler", "Lesson 28: Cargo and the basics");

const OVERFLOW_OPS = ["+", "wrapping_add", "checked_add", "saturating_add"] as const;

const COMPILES = {
  ok: "It compiles and runs fine",
  mut: "Error: x isn't declared mut",
  types: "Error: the types don't match",
  overflow: "Error: overflow at compile time",
} as const;

const COMPILE_CASES: { code: string; k: keyof typeof COMPILES; why: string }[] = [
  { code: "let x = 5;\nlet x = x + 1;", k: "ok", why: "The second `let` declares a new `x` that shadows the first. Nothing is mutated." },
  { code: "let x = 5;\nx += 1;", k: "mut", why: "Bindings are immutable unless declared `mut`: error E0384, cannot assign twice to an immutable variable." },
  { code: "let mut x = 5;\nx = \"five\";", k: "types", why: "`mut` lets the value change, never the type: x is an integer for life. Shadowing (`let x = \"five\";`) could change it." },
  { code: "let x = 5;\nlet x = \"five\";", k: "ok", why: "Shadowing declares a new variable, so it may have a new type. It's how `let n = n.parse()…` reads naturally." },
  { code: "let ok = true;\nlet n = if ok { 1 } else { \"one\" };", k: "types", why: "`if` is an expression, so both arms must have the same type: an integer and a `&str` can't both be `n`." },
  { code: "fn double(n: i32) -> i32 {\n    n * 2;\n}", k: "types", why: "The semicolon makes `n * 2;` a statement, so the body's value is `()`, not `i32`. The help line says: remove this semicolon." },
  { code: "fn double(n: i32) -> i32 {\n    n * 2\n}", k: "ok", why: "The last expression, without a semicolon, is the function's value. No `return` needed." },
  { code: "let big: i64 = 5;\nlet small: i32 = big;", k: "types", why: "Rust never converts integer types silently. Write `big as i32` (truncates) or `i32::try_from(big)` (checks)." },
  { code: "let mut total = 0;\nfor i in 0..3 {\n    total += i;\n}", k: "ok", why: "`total` is declared `mut`, so `+=` is allowed. `0..3` yields 0, 1 and 2." },
  { code: "let total = 0;\nfor i in 0..3 {\n    total += i;\n}", k: "mut", why: "Without `mut`, `total += i` is an assignment to an immutable binding: E0384." },
  { code: "let x: u8 = 255;\nlet y = x + 1;", k: "overflow", why: "The compiler can see both values, and its `arithmetic_overflow` lint is an error by default: \"this arithmetic operation will overflow\". With a value read at runtime, a debug build would panic instead." },
];

const basicsDrill: Drill = {
  id: "rust-basics",
  title: "Predict the compiler",
  blurb: "What overflow does in each build and with each method, and which snippets compile: new cases every round.",
  generators: [
    {
      id: "drill-rust-overflow",
      title: "What does overflow do?",
      generate: (rng: Rng) => {
        const x = rng.int(200, 255);
        const k = rng.int(1, 90);
        const op = rng.pick(OVERFLOW_OPS);
        const release = rng.chance(0.5);
        const sum = x + k;
        const over = sum > 255;
        const wrap = sum % 256;
        const expr = op === "+" ? `x + ${k}` : `x.${op}(${k})`;
        const panic = "The program panics instead";
        let correct: string;
        let why: string;
        if (op === "+") {
          correct = !over ? `The result is ${sum}` : release ? `The result is ${wrap}` : panic;
          why = !over
            ? `${x} + ${k} = ${sum} fits in a u8 (0–255), so nothing special happens.`
            : release
              ? `Release builds drop the overflow check and wrap: ${sum} − 256 = ${wrap}. The Book calls relying on this an error; say \`wrapping_add\` when you mean it.`
              : `Debug builds check arithmetic: ${sum} doesn't fit in a u8, so the program panics with "attempt to add with overflow".`;
        } else if (op === "wrapping_add") {
          correct = `The result is ${wrap}`;
          why = over
            ? `\`wrapping_add\` wraps in every build: ${sum} − 256 = ${wrap}.`
            : `No overflow: ${x} + ${k} = ${sum}. \`wrapping_add\` only differs when the sum passes 255.`;
        } else if (op === "checked_add") {
          correct = over ? "The result is None" : `The result is Some(${sum})`;
          why = `\`checked_add\` returns an \`Option<u8>\`: \`Some(sum)\` when it fits, \`None\` on overflow. Here ${x} + ${k} = ${sum}${over ? ", too big" : ", which fits"}, in either build.`;
        } else {
          correct = `The result is ${over ? 255 : sum}`;
          why = over
            ? `\`saturating_add\` clamps at the type's maximum: ${sum} becomes 255, in every build.`
            : `No overflow: ${x} + ${k} = ${sum}, so saturating changes nothing.`;
        }
        const pool = [panic, `The result is ${wrap}`, "The result is 255", "The result is None", `The result is Some(${wrap})`, `The result is ${sum}`];
        const wrong = rng.sample([...new Set(pool)].filter((o) => o !== correct), 3);
        return choice(rng, {
          genId: "drill-rust-overflow",
          prompt: `\`x\` is a \`u8\` read at runtime, and it's ${x}. In a **${release ? "release" : "debug"}** build, what does \`${expr}\` give?`,
          correct,
          wrong,
          explanation: `${why} See [The Book, §3.2](https://doc.rust-lang.org/book/ch03-02-data-types.html#integer-overflow).`,
          docRef: L28,
        });
      },
    },
    {
      id: "drill-rust-compiles",
      title: "Does it compile?",
      generate: (rng: Rng) => {
        const c = rng.pick(COMPILE_CASES);
        const { correct, wrong } = pickFrom(COMPILES, c.k);
        return choice(rng, {
          genId: "drill-rust-compiles",
          prompt: "What happens when you `cargo build` this?",
          code: c.code,
          codeLang: "rust",
          correct,
          wrong,
          explanation: c.why,
          docRef: L28,
        });
      },
    },
  ],
};

/* ── Lesson 29: ownership ── */

const L29 = lessonRef("0029-ownership", "Lesson 29: ownership");

const USABLE = {
  copy: "Yes, because the value was copied",
  borrow: "Yes, because only a borrow happened",
  clone: "Yes, because a clone was made",
  moved: "No, because the value was moved",
} as const;

const USABLE_CASES: { code: string; k: keyof typeof USABLE; why: string }[] = [
  { code: "let a = 5;\nlet b = a;\nprintln!(\"{a} {b}\");", k: "copy", why: "`i32` is `Copy`: `let b = a` copies the bits, and both stay usable. Integers, `bool`, `char`, and tuples of them are `Copy`." },
  { code: "let s = String::from(\"hi\");\nlet t = s;\nprintln!(\"{s} {t}\");", k: "moved", why: "`String` owns a heap buffer, so `let t = s` moves it: `t` owns the buffer now and `s` is unusable (E0382). Copying the pointer would mean two owners freeing one buffer." },
  { code: "let s = String::from(\"hi\");\nlet t = s.clone();\nprintln!(\"{s} {t}\");", k: "clone", why: "`.clone()` makes a second, independent buffer: two owners, two allocations. It works, and it costs a copy." },
  { code: "fn len(s: &String) -> usize {\n    s.len()\n}\n\nlet s = String::from(\"hi\");\nlet n = len(&s);\nprintln!(\"{s} {n}\");", k: "borrow", why: "`len(&s)` lends the String; the function reads it and gives it back when it returns. `s` still owns its buffer." },
  { code: "fn take(s: String) {}\n\nlet s = String::from(\"hi\");\ntake(s);\nprintln!(\"{s}\");", k: "moved", why: "`take(s: String)` takes ownership: the String is dropped at the end of `take`. Afterwards `s` is moved out (E0382)." },
  { code: "let v = vec![String::from(\"a\")];\nfor w in v {\n    println!(\"{w}\");\n}\nprintln!(\"{}\", v.len());", k: "moved", why: "`for w in v` consumes the Vec: each String moves into `w`, and the Vec is gone after the loop (E0382 on `v.len()`)." },
  { code: "let v = vec![String::from(\"a\")];\nfor w in &v {\n    println!(\"{w}\");\n}\nprintln!(\"{}\", v.len());", k: "borrow", why: "`for w in &v` iterates over references: the Vec is only borrowed and still usable after the loop." },
  { code: "let t = (1, true);\nlet u = t;\nprintln!(\"{t:?} {u:?}\");", k: "copy", why: "A tuple of `Copy` types is `Copy` itself, so `let u = t` copies it." },
  { code: "let t = (1, String::from(\"x\"));\nlet u = t;\nprintln!(\"{t:?} {u:?}\");", k: "moved", why: "One field is a `String`, so the tuple isn't `Copy`: `let u = t` moves the whole tuple (E0382)." },
  { code: "let mut v = Vec::new();\nlet s = String::from(\"x\");\nv.push(s);\nprintln!(\"{s} {}\", v.len());", k: "moved", why: "`v.push(s)` moves the String into the Vec: the Vec owns it now, and `s` is moved out (E0382)." },
  { code: "let x: &str = \"hi\";\nlet y = x;\nprintln!(\"{x} {y}\");", k: "copy", why: "A shared reference (`&str` here) is `Copy`: copying it copies the pointer, and both point at the same text, which nobody owns twice." },
  { code: "let s = String::from(\"hi\");\nlet r = &s;\nlet n = r.len();\nprintln!(\"{s} {n}\");", k: "borrow", why: "`let r = &s` borrows. Reading through `r` leaves `s` as the owner, so both lines work." },
];

const ERROR_CODES = {
  E0382: "E0382: use after a move",
  E0507: "E0507: move out of borrow",
  E0515: "E0515: reference to a local",
  E0384: "E0384: reassigning an immutable binding",
} as const;

const ERROR_CASES: { code: string; k: keyof typeof ERROR_CODES; why: string }[] = [
  { code: "fn shout(s: String) -> String {\n    s.to_uppercase()\n}\n\nlet title = String::from(\"judge\");\nlet loud = shout(title);\nprintln!(\"{loud} {}\", title.len());", k: "E0382", why: "`shout(title)` moves `title` into the function, then `title.len()` uses it: E0382, borrow of moved value. Make `shout` take `&str` and call `shout(&title)`." },
  { code: "let argv = vec![String::from(\"ls\")];\nlet program = argv[0];\nprintln!(\"{program}\");", k: "E0507", why: "Indexing gives a place inside the Vec; you can't move a String out of it and leave a hole: E0507. Borrow it: `&argv[0]`." },
  { code: "struct Job {\n    stdin: Option<String>,\n}\nfn len(job: &Job) -> usize {\n    match job.stdin {\n        Some(s) => s.len(),\n        None => 0,\n    }\n}\n\nprintln!(\"{}\", len(&Job { stdin: None }));", k: "E0507", why: "`job` is a shared reference, so `match job.stdin` can't move the String out of it: E0507. Match on `&job.stdin` to bind `s` as a reference." },
  { code: "fn first(line: &str) -> &str {\n    let owned = line.trim().to_string();\n    owned.split(' ').next().unwrap_or(\"\")\n}\n\nprintln!(\"{}\", first(\" a b\"));", k: "E0515", why: "`owned` is dropped when the function returns, so a slice of it would dangle: E0515, cannot return a value referencing a local variable. This is C's \"return a pointer to a stack buffer\", refused at compile time." },
  { code: "let count = 0;\ncount = 1;\nprintln!(\"{count}\");", k: "E0384", why: "`count` isn't `mut`, so a second assignment is refused: E0384." },
  { code: "let words = vec![String::from(\"a\")];\nfor w in words {\n    println!(\"{w}\");\n}\nprintln!(\"{}\", words.len());", k: "E0382", why: "`for w in words` consumes the Vec, so `words.len()` afterwards uses a moved value: E0382. Iterate over `&words`." },
];

const ownershipDrill: Drill = {
  id: "rust-ownership",
  title: "Who owns it now?",
  blurb: "Whether a value is still usable after a move, a copy, a clone or a borrow, and which error the compiler gives.",
  generators: [
    {
      id: "drill-rust-usable",
      title: "Does the last line compile?",
      generate: (rng: Rng) => {
        const c = rng.pick(USABLE_CASES);
        const { correct, wrong } = pickFrom(USABLE, c.k);
        return choice(rng, {
          genId: "drill-rust-usable",
          prompt: "Does the last line compile?",
          code: c.code,
          codeLang: "rust",
          correct,
          wrong,
          explanation: `${c.why} See [The Book, §4.1](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html).`,
          docRef: L29,
        });
      },
    },
    {
      id: "drill-rust-error-code",
      title: "Name the error",
      generate: (rng: Rng) => {
        const c = rng.pick(ERROR_CASES);
        const { correct, wrong } = pickFrom(ERROR_CODES, c.k);
        return choice(rng, {
          genId: "drill-rust-error-code",
          prompt: "This doesn't compile. Which error does rustc report first?",
          code: c.code,
          codeLang: "rust",
          correct,
          wrong,
          explanation: `${c.why} \`rustc --explain ${c.k}\` tells the long story.`,
          docRef: L29,
        });
      },
    },
  ],
};

/* ── Lesson 30: borrowing ── */

const L30 = lessonRef("0030-borrowing", "Lesson 30: borrowing");

const BORROWS = {
  ok: "It compiles: no borrows overlap",
  E0502: "E0502: shared and mutable overlap",
  E0499: "E0499: two mutable borrows overlap",
  E0506: "E0506: assigning while it's borrowed",
} as const;

const BORROW_CASES: { code: string; k: keyof typeof BORROWS; why: string }[] = [
  { code: "let mut v = vec![1, 2, 3];\nlet first = &v[0];\nv.push(4);\nprintln!(\"{first}\");", k: "E0502", why: "`first` borrows into the Vec, and `push` may reallocate the buffer, which would leave `first` dangling. Since `first` is used after the push, the shared and mutable borrows overlap: E0502. (The Book's own example, \u00a78.1.)" },
  { code: "let mut v = vec![1, 2, 3];\nlet first = &v[0];\nprintln!(\"{first}\");\nv.push(4);", k: "ok", why: "A borrow lasts until its last use, not until the end of the scope. `first` is last used before `push`, so they never overlap." },
  { code: "let mut s = String::new();\nlet a = &mut s;\nlet b = &mut s;\na.push('x');\nb.push('y');", k: "E0499", why: "`a` and `b` are both mutable borrows of `s`, and `a` is used after `b` is created: two writers at once, E0499." },
  { code: "let mut s = String::new();\nlet a = &mut s;\na.push('x');\nlet b = &mut s;\nb.push('y');", k: "ok", why: "`a`'s last use comes before `b` is created, so there's only ever one mutable borrow alive." },
  { code: "let s = String::from(\"hi\");\nlet a = &s;\nlet b = &s;\nprintln!(\"{a} {b}\");", k: "ok", why: "Any number of shared borrows may coexist: many readers, no writer." },
  { code: "let mut x = 5;\nlet r = &x;\nx = 6;\nprintln!(\"{r}\");", k: "E0506", why: "`r` still reads `x` later, so `x` can't be assigned meanwhile: E0506, cannot assign to `x` because it is borrowed." },
  { code: "let mut v = vec![1];\nfor n in &v {\n    v.push(*n);\n}", k: "E0502", why: "The loop holds a shared borrow of `v` for its whole duration, and `push` needs a mutable one. In C++ this is iterator invalidation; here it doesn't compile." },
  { code: "let mut s = String::from(\"a\");\nlet r = &s;\ns.push('b');\nprintln!(\"{r}\");", k: "E0502", why: "`r` borrows `s`, `push` borrows it mutably (and may reallocate), then `r` is used: E0502." },
  { code: "let mut v = vec![1, 2];\nlet total: i32 = v.iter().sum();\nv.push(total);", k: "ok", why: "`iter().sum()` finishes before `push`: the shared borrow ends, then the mutable one starts." },
  { code: "let mut x = 5;\nlet r = &mut x;\n*r += 1;\nprintln!(\"{x}\");", k: "ok", why: "`r` is last used at `*r += 1`; reading `x` afterwards doesn't overlap with it." },
  { code: "let mut x = 5;\nlet r = &mut x;\nprintln!(\"{x}\");\n*r += 1;", k: "E0502", why: "Reading `x` needs a shared borrow while the mutable borrow `r` is still alive (it's used on the next line): E0502." },
  { code: "let mut x = 5;\nlet r = &x;\nx += 1;\nprintln!(\"{r}\");", k: "E0506", why: "`x += 1` assigns to `x` while `r` still borrows it (it's printed afterwards): E0506." },
];

const PARAM_CASES: { task: string; family: "str" | "vec"; k: string; why: string }[] = [
  { task: "counts the words in a line", family: "str", k: "`&str`, borrowed", why: "It only reads, so it borrows. `&str` accepts a `String` (`&s`), a literal, or a slice of either." },
  { task: "appends a newline to the caller's buffer", family: "str", k: "`&mut String`", why: "It changes the caller's String, so it needs an exclusive borrow of a growable string." },
  { task: "stores the name in a struct it returns", family: "str", k: "`String`, owned", why: "The struct must own its data to outlive the call, so the function takes ownership." },
  { task: "checks whether a token is a valid number", family: "str", k: "`&str`, borrowed", why: "Read-only, so a `&str` borrow: callers can pass tokens that are slices of a bigger output." },
  { task: "upper-cases the caller's string in place", family: "str", k: "`&mut String`", why: "In-place change of the caller's data: an exclusive borrow." },
  { task: "sums the scores in a list", family: "vec", k: "`&[i32]`, borrowed", why: "Read-only, so a slice: it accepts a `Vec`, an array, or part of either." },
  { task: "appends a score to the caller's list", family: "vec", k: "`&mut Vec<i32>`", why: "Pushing may grow the buffer, which needs the Vec itself, borrowed exclusively. A `&mut [i32]` can change elements but never the length." },
  { task: "keeps the list as a field of a new leaderboard", family: "vec", k: "`Vec<i32>`, owned", why: "The leaderboard must own the list to outlive the call: take ownership." },
  { task: "sorts the caller's scores in place", family: "vec", k: "`&mut [i32]`", why: "Sorting changes elements but not the length, so a mutable slice is enough, and it accepts arrays too." },
];

const PARAM_OPTIONS = {
  str: ["`&str`, borrowed", "`&mut String`", "`String`, owned", "`&String`, borrowed"],
  vec: ["`&[i32]`, borrowed", "`&mut Vec<i32>`", "`Vec<i32>`, owned", "`&mut [i32]`"],
} as const;

const borrowingDrill: Drill = {
  id: "rust-borrowing",
  title: "Many readers or one writer",
  blurb: "Whether two borrows overlap, and which parameter type a function should take.",
  generators: [
    {
      id: "drill-rust-borrows",
      title: "Do the borrows overlap?",
      generate: (rng: Rng) => {
        const c = rng.pick(BORROW_CASES);
        const { correct, wrong } = pickFrom(BORROWS, c.k);
        return choice(rng, {
          genId: "drill-rust-borrows",
          prompt: "What does rustc say?",
          code: c.code,
          codeLang: "rust",
          correct,
          wrong,
          explanation: `${c.why} See [The Book, §4.2](https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html).`,
          docRef: L30,
        });
      },
    },
    {
      id: "drill-rust-param-type",
      title: "Pick the parameter type",
      generate: (rng: Rng) => {
        const c = rng.pick(PARAM_CASES);
        const wrong = PARAM_OPTIONS[c.family].filter((o) => o !== c.k);
        const ampString = c.family === "str" ? " `&String` is never the best choice: it accepts less than `&str` and does no more (clippy's `ptr_arg` lint says so)." : "";
        return choice(rng, {
          genId: "drill-rust-param-type",
          prompt: `A function ${c.task}. What should its parameter's type be?`,
          correct: c.k,
          wrong,
          explanation: `${c.why}${ampString}`,
          docRef: L30,
        });
      },
    },
  ],
};

/* ── Lesson 31: enums and match ── */

const L31 = lessonRef("0031-enums-and-match", "Lesson 31: enums and match");

const MATCHES = {
  ok: "Compiles: every case is covered",
  E0004: "E0004: a case is missing",
  E0005: "E0005: refutable pattern in let",
  E0308: "E0308: the arms' types differ",
} as const;

const MATCH_CASES: { code: string; k: keyof typeof MATCHES; why: string }[] = [
  { code: "let opt: Option<i32> = Some(3);\nlet n = match opt {\n    Some(n) => n,\n};", k: "E0004", why: "`match` must cover every value, and `None` isn't covered: E0004, non-exhaustive patterns. Add `None => \u2026`." },
  { code: "let n: i32 = 7;\nlet s = match n {\n    0 => \"zero\",\n    1.. => \"positive\",\n};", k: "E0004", why: "An `i32` can be negative, and `0` plus `1..` leaves `i32::MIN..=-1` uncovered: E0004. The compiler reasons about integer ranges too." },
  { code: "let n: u32 = 7;\nlet s = match n {\n    0 => \"zero\",\n    1.. => \"positive\",\n};", k: "ok", why: "A `u32` can't be negative, so `0` and `1..` cover every value: exhaustive, no `_` needed." },
  { code: "let opt: Option<i32> = Some(3);\nlet Some(x) = opt;", k: "E0005", why: "`let` needs a pattern that always matches, and `Some(x)` doesn't match `None`: E0005, refutable pattern in local binding. Use `let \u2026 else` or `if let`." },
  { code: "let opt: Option<i32> = Some(3);\nlet Some(x) = opt else {\n    return;\n};", k: "ok", why: "`let \u2026 else` handles the non-matching case in its `else` block, which must leave the function (`return`, `break`, `continue` or a panic)." },
  { code: "let opt: Option<i32> = None;\nif let Some(x) = opt {\n    println!(\"{x}\");\n}", k: "ok", why: "`if let` runs its block only when the pattern matches; a missing `else` means \"otherwise, do nothing\"." },
  { code: "let n = 3;\nlet s = match n {\n    0 => \"zero\",\n    _ => 1,\n};", k: "E0308", why: "`match` is an expression, so every arm must have the same type: a `&str` and an integer can't both be `s`. E0308." },
  { code: "let r: Result<i32, String> = Ok(1);\nlet v = match r {\n    Ok(v) => v,\n};", k: "E0004", why: "`Result` has two variants, and `Err(_)` isn't covered: E0004. This is why you can't forget an error in Rust." },
  { code: "enum Light {\n    Red,\n    Amber,\n    Green,\n}\n\nlet l = Light::Amber;\nlet go = match l {\n    Light::Green => true,\n    _ => false,\n};", k: "ok", why: "`_` matches everything that's left, so the match is exhaustive. (The cost: add a variant later, and `_` silently swallows it.)" },
  { code: "let pair = (true, false);\nlet s = match pair {\n    (true, true) => \"both\",\n    (false, false) => \"neither\",\n};", k: "E0004", why: "Tuples are matched element by element: `(true, false)` and `(false, true)` aren't covered. E0004 names them." },
  { code: "let b = true;\nlet n = match b {\n    true => 1,\n    false => 0,\n};", k: "ok", why: "`true` and `false` are all the values a `bool` has: exhaustive." },
  { code: "let opt = Some(5);\nlet n = match opt {\n    Some(x) if x > 3 => x,\n    None => 0,\n};", k: "E0004", why: "Guards (`if x > 3`) don't count towards exhaustiveness, since the compiler can't prove them. `Some(_)` with `x <= 3` isn't covered: E0004." },
];

const TEST_VERDICTS = ["TLE", "MLE", "OLE", "RE", "WA", "Passed"] as const;

const matchDrill: Drill = {
  id: "rust-match",
  title: "Every case, in order",
  blurb: "Lesson 9's verdict order applied to fresh runner facts, and which matches the compiler accepts.",
  generators: [
    {
      id: "drill-rust-verdict-order",
      title: "Which verdict?",
      generate: (rng: Rng) => {
        const kind = rng.pick(["ok", "exit", "signal", "timeout"] as const);
        const code = rng.pick([1, 2, 3, 101, 134]);
        const sig = rng.pick([6, 8, 9, 11, 25]);
        const oom = rng.chance(0.3);
        const capped = rng.chance(0.3);
        const right = rng.chance(0.5);
        const ending =
          kind === "ok" ? "`Exited(0)`" : kind === "exit" ? `\`Exited(${code})\`` : kind === "signal" ? `\`Signaled(${sig})\`` : "`TimedOut`";
        let correct: (typeof TEST_VERDICTS)[number];
        let rule: string;
        if (kind === "timeout") [correct, rule] = ["TLE", "The deadline is checked first, whatever else happened."];
        else if (oom) [correct, rule] = ["MLE", "The OOM killer fired, and memory comes right after time."];
        else if (capped) [correct, rule] = ["OLE", "It printed past the cap, which is checked before how it ended."];
        else if (kind !== "ok") [correct, rule] = ["RE", "It didn't end with exit 0, so its output isn't even read."];
        else if (!right) [correct, rule] = ["WA", "It ended normally, and the tokens don't match."];
        else [correct, rule] = ["Passed", "Every check passed: the limits, the ending, and the tokens."];
        const wrong = rng.sample(TEST_VERDICTS.filter((v) => v !== correct), 3);
        return choice(rng, {
          genId: "drill-rust-verdict-order",
          prompt: `The runner reports: ending ${ending}, \`oom_killed: ${oom}\`, \`output_capped: ${capped}\`, and the output's tokens ${right ? "match" : "don't match"} the expected ones. What does \`judge_test\` return?`,
          correct,
          wrong,
          explanation: `${rule} Lesson 9's order: TLE, MLE, OLE, RE, then WA. A \`match\` with guards encodes it: the first arm that fits wins.`,
          docRef: L31,
        });
      },
    },
    {
      id: "drill-rust-exhaustive",
      title: "Does this match compile?",
      generate: (rng: Rng) => {
        const c = rng.pick(MATCH_CASES);
        const { correct, wrong } = pickFrom(MATCHES, c.k);
        return choice(rng, {
          genId: "drill-rust-exhaustive",
          prompt: "What does rustc say?",
          code: c.code,
          codeLang: "rust",
          correct,
          wrong,
          explanation: `${c.why} See [The Book, §6.2](https://doc.rust-lang.org/book/ch06-02-match.html).`,
          docRef: L31,
        });
      },
    },
  ],
};

/* ── Lesson 32: Result and ? ── */

const L32 = lessonRef("0032-errors-as-values", "Lesson 32: errors as values");

type ParseKind = "ok" | "invalid" | "large" | "small" | "empty";
const PARSE_CASES: { input: string; ty: string; k: ParseKind; v?: string; why: string }[] = [
  { input: "42", ty: "u32", k: "ok", v: "42", why: "Plain digits that fit: `Ok(42)`." },
  { input: "-1", ty: "u32", k: "invalid", why: "An unsigned type has no sign, so `-` is an invalid digit (not \"too small\")." },
  { input: " 7", ty: "u8", k: "invalid", why: "`parse` doesn't trim: the space is an invalid digit. Call `.trim()` first." },
  { input: "7\\n", ty: "u8", k: "invalid", why: "A line read from input keeps its newline, and `parse` doesn't trim it: invalid digit. `.trim()` first, always." },
  { input: "300", ty: "u8", k: "large", why: "A `u8` holds 0 to 255: \"number too large to fit in target type\"." },
  { input: "+5", ty: "i32", k: "ok", v: "5", why: "A leading `+` is accepted: `Ok(5)`." },
  { input: "-129", ty: "i8", k: "small", why: "An `i8` holds -128 to 127: \"number too small to fit in target type\"." },
  { input: "-128", ty: "i8", k: "ok", v: "-128", why: "-128 is exactly `i8::MIN`: it fits." },
  { input: "", ty: "i32", k: "empty", why: "\"cannot parse integer from empty string\": its own error kind, `IntErrorKind::Empty`." },
  { input: "0x10", ty: "i32", k: "invalid", why: "`parse` reads decimal only; `x` is an invalid digit. Hex needs `i32::from_str_radix(\"10\", 16)`." },
  { input: "1e3", ty: "u32", k: "invalid", why: "Exponents are float syntax; for an integer, `e` is an invalid digit. (`\"1e3\".parse::<f64>()` gives 1000.0.)" },
  { input: "3.0", ty: "i32", k: "invalid", why: "The `.` is an invalid digit for an integer, even though the value is whole." },
  { input: "007", ty: "u32", k: "ok", v: "7", why: "Leading zeros are fine in decimal: `Ok(7)`." },
  { input: "4294967296", ty: "u32", k: "large", why: "`u32::MAX` is 4294967295, one less: too large." },
];

const QMARK = {
  ok: "It compiles: ? fits here",
  ret: "E0277: ? isn't allowed here",
  from: "E0277: no From conversion exists",
  E0308: "E0308: the return type differs",
} as const;

const QMARK_CASES: { code: string; k: keyof typeof QMARK; why: string }[] = [
  { code: "use std::num::ParseIntError;\n\nfn f(s: &str) -> Result<u32, ParseIntError> {\n    let n = s.parse::<u32>()?;\n    Ok(n * 2)\n}", k: "ok", why: "`parse::<u32>()` fails with a `ParseIntError`, and the function returns exactly that error type, so `?` passes it up unchanged." },
  { code: "fn f(s: &str) -> u32 {\n    let n: u32 = s.parse()?;\n    n * 2\n}", k: "ret", why: "`?` returns early with the error, so the function must return a `Result` (or an `Option`). This one returns a plain `u32`: E0277." },
  { code: "fn f(s: &str) -> Result<u32, String> {\n    let n = s.parse::<u32>()?;\n    Ok(n * 2)\n}", k: "from", why: "`?` converts the error with `From`, and there's no `From<ParseIntError> for String`: E0277, \"couldn't convert the error to String\". `map_err(|e| e.to_string())` converts it by hand." },
  { code: "use std::error::Error;\n\nfn f(s: &str) -> Result<u32, Box<dyn Error>> {\n    let n = s.parse::<u32>()?;\n    Ok(n * 2)\n}", k: "ok", why: "`Box<dyn Error>` accepts any error type (there's a blanket `From` for it), so `?` converts the `ParseIntError` into a box. Handy in `main` and scripts." },
  { code: "fn f(s: &str) -> Option<u32> {\n    let n = s.parse::<u32>().ok()?;\n    Some(n * 2)\n}", k: "ok", why: "`.ok()` turns the `Result` into an `Option`, and in a function returning `Option`, `?` on an `Option` returns `None` early." },
  { code: "fn f(s: &str) -> Option<u32> {\n    let n = s.parse::<u32>()?;\n    Some(n * 2)\n}", k: "ret", why: "In a function returning `Option`, `?` works on `Option`s only; a `Result` needs `.ok()` first. E0277 says exactly that." },
  { code: "use std::num::ParseIntError;\n\nfn f(s: &str) -> Result<u32, ParseIntError> {\n    let n = s.parse::<u32>()?;\n    n * 2\n}", k: "E0308", why: "The `?` is fine; the last line isn't: `n * 2` is a `u32`, and the function returns a `Result`. Wrap it: `Ok(n * 2)`." },
  { code: "fn f(s: &str) -> Result<u32, String> {\n    let n = s.parse::<u32>().map_err(|e| e.to_string())?;\n    Ok(n * 2)\n}", k: "ok", why: "`map_err` turns the `ParseIntError` into a `String` first, so `?` has nothing left to convert." },
  { code: "fn f(path: &str) -> std::io::Result<usize> {\n    let text = std::fs::read_to_string(path)?;\n    Ok(text.len())\n}", k: "ok", why: "`std::io::Result<T>` is `Result<T, std::io::Error>`, the error `read_to_string` returns: `?` fits as is." },
  { code: "use std::num::ParseIntError;\n\nfn f(path: &str) -> Result<u32, ParseIntError> {\n    let text = std::fs::read_to_string(path)?;\n    text.trim().parse()\n}", k: "from", why: "`read_to_string` fails with an `io::Error`, and the function's error type is `ParseIntError`, with no `From` between them: E0277. A custom enum with two `From` impls (the lab's `LoadError`) is the fix." },
];

const errorsDrill: Drill = {
  id: "rust-errors",
  title: "Ok, Err, and where ? fits",
  blurb: "What parse really returns for tricky inputs, and whether a ? compiles where it sits.",
  generators: [
    {
      id: "drill-rust-parse",
      title: "What does parse return?",
      generate: (rng: Rng) => {
        const c = rng.pick(PARSE_CASES);
        const options: Record<ParseKind, string> = {
          ok: `Ok(${c.v ?? "0"}): it parses fine`,
          invalid: "Err: an invalid digit",
          large: "Err: number too large",
          small: "Err: number too small",
          empty: "Err: the string's empty",
        };
        const correct = options[c.k];
        const wrong = rng.sample(Object.values(options).filter((o) => o !== correct), 3);
        return choice(rng, {
          genId: "drill-rust-parse",
          prompt: `What does \`"${c.input}".parse::<${c.ty}>()\` return?`,
          correct,
          wrong,
          explanation: `${c.why} The error kinds are listed in [IntErrorKind](https://doc.rust-lang.org/std/num/enum.IntErrorKind.html).`,
          docRef: L32,
        });
      },
    },
    {
      id: "drill-rust-question-mark",
      title: "Does the ? compile?",
      generate: (rng: Rng) => {
        const c = rng.pick(QMARK_CASES);
        const { correct, wrong } = pickFrom(QMARK, c.k);
        return choice(rng, {
          genId: "drill-rust-question-mark",
          prompt: "What does rustc say?",
          code: c.code,
          codeLang: "rust",
          correct,
          wrong,
          explanation: `${c.why} See [The Book, §9.2](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html).`,
          docRef: L32,
        });
      },
    },
  ],
};

/* ── Lesson 33: traits and generics ── */

const L33 = lessonRef("0033-traits-and-generics", "Lesson 33: traits and generics");

const DISPATCH = {
  generic: "Generics: static dispatch, inlined",
  dyn: "Box<dyn Checker>: dynamic dispatch",
  enum: "An enum, with match",
  macro: "A macro per type",
} as const;

const DISPATCH_CASES: { task: string; k: keyof typeof DISPATCH; why: string }[] = [
  { task: "Checkers of different types must sit together in one Vec.", k: "dyn", why: "A Vec holds one type. `Box<dyn Checker>` is one type (a pointer plus a vtable) for any checker." },
  { task: "Other crates will add checker types the judge has never seen.", k: "dyn", why: "An open set of types, chosen at runtime: trait objects. An enum would need editing for every new checker." },
  { task: "`count_passed` runs a billion times, and the checker's type is known at compile time.", k: "generic", why: "Generics are monomorphized: one copy per type, with direct calls the optimizer can inline. No vtable lookup." },
  { task: "A wrapper adds case-insensitivity to any checker, and must cost nothing at runtime.", k: "generic", why: "`IgnoreCase<C: Checker>` is a generic struct: the wrapped checker's calls are resolved at compile time." },
  { task: "A function prints any value that implements `Display`, called with three different types.", k: "generic", why: "`fn show<T: Display>(x: T)` (or `x: impl Display`) is the idiom; the compiler writes one version per type." },
  { task: "There are exactly three checkers, forever, and forgetting one must be a compile error.", k: "enum", why: "A closed set is an enum: `match` is exhaustive, so a new variant breaks every place that must handle it. Traits can't promise that." },
  { task: "Messages on a WebSocket are one of four fixed kinds, each with its own fields.", k: "enum", why: "A fixed set of shapes with different data is exactly what an enum is: a tagged union, matched exhaustively." },
];

const TRAIT_ERRORS = {
  ok: "It compiles as written",
  E0046: "E0046: missing trait method",
  E0277: "E0277: trait bound unsatisfied",
  E0038: "E0038: not dyn compatible",
} as const;

const TRAIT_CASES: { code: string; k: keyof typeof TRAIT_ERRORS; why: string }[] = [
  { code: "trait Checker {\n    fn check(&self, e: &str, a: &str) -> bool;\n    fn name(&self) -> String;\n}\n\nstruct Exact;\n\nimpl Checker for Exact {\n    fn check(&self, e: &str, a: &str) -> bool {\n        e == a\n    }\n}", k: "E0046", why: "The trait requires `name`, has no default for it, and the impl doesn't provide it: E0046, \"not all trait items implemented, missing: `name`\"." },
  { code: "trait Checker {\n    fn check(&self, e: &str, a: &str) -> bool;\n    fn name(&self) -> String {\n        \"unnamed\".to_string()\n    }\n}\n\nstruct Exact;\n\nimpl Checker for Exact {\n    fn check(&self, e: &str, a: &str) -> bool {\n        e == a\n    }\n}", k: "ok", why: "`name` has a default body in the trait, so an impl may skip it and inherit the default." },
  { code: "use std::fmt::Display;\n\nfn show<T: Display>(x: T) {\n    println!(\"{x}\");\n}\n\nstruct Point(i32, i32);\n\nfn demo() {\n    show(Point(1, 2));\n}", k: "E0277", why: "`show` requires `T: Display`, and `Point` doesn't implement it: E0277. Derive `Debug` and print with `{:?}`, or write `impl Display for Point`." },
  { code: "fn show<T>(x: T) {\n    println!(\"{x}\");\n}", k: "E0277", why: "Inside a generic function you may only use what the bounds promise. `T` has no bounds, so `{x}` (which needs `Display`) isn't allowed: E0277. Add `T: Display`." },
  { code: "trait Checker {\n    fn check<T: AsRef<str>>(&self, e: T, a: T) -> bool;\n}\n\nfn all(v: Vec<Box<dyn Checker>>) -> usize {\n    v.len()\n}", k: "E0038", why: "A generic method can't go in a vtable (there'd be one copy per `T`), so a trait with one can't be a `dyn Checker`: E0038, \"not dyn compatible\"." },
  { code: "trait Checker {\n    fn new() -> Self;\n    fn check(&self, e: &str, a: &str) -> bool;\n}\n\nfn pick(c: &dyn Checker) -> bool {\n    c.check(\"1\", \"1\")\n}", k: "E0038", why: "`fn new() -> Self` needs to know the concrete type, which a `dyn Checker` has forgotten: E0038. Adding `where Self: Sized` to that method excludes it from the trait object and fixes it." },
  { code: "use std::fmt::Display;\n\nfn demo() {\n    let v: Vec<Box<dyn Display>> = vec![Box::new(1), Box::new(\"a\")];\n    for x in &v {\n        println!(\"{x}\");\n    }\n}", k: "ok", why: "`Box<dyn Display>` holds any type implementing `Display`, so integers and strings can share one Vec. Each call goes through the vtable." },
  { code: "struct P;\n\nfn demo() {\n    println!(\"{:?}\", P);\n}", k: "E0277", why: "`{:?}` needs `Debug`, which `P` doesn't implement: E0277. `#[derive(Debug)]` writes it for you." },
  { code: "#[derive(Debug)]\nstruct P;\n\nfn demo() {\n    println!(\"{:?}\", P);\n}", k: "ok", why: "`#[derive(Debug)]` generates the `Debug` impl, so `{:?}` works." },
  { code: "fn longest<T: PartialOrd + Copy>(v: &[T]) -> T {\n    let mut best = v[0];\n    for &x in v {\n        if x > best {\n            best = x;\n        }\n    }\n    best\n}\n\nfn demo() {\n    println!(\"{} {}\", longest(&[3, 9, 2]), longest(&[1.5, 0.5]));\n}", k: "ok", why: "`T: PartialOrd + Copy` promises `>` and copying, which is all the body uses. One copy of `longest` is compiled for `i32`, another for `f64`." },
];

const traitsDrill: Drill = {
  id: "rust-traits",
  title: "Generics, trait objects or an enum?",
  blurb: "Picking the right kind of polymorphism for a job, and reading trait errors.",
  generators: [
    {
      id: "drill-rust-dispatch",
      title: "Pick the tool",
      generate: (rng: Rng) => {
        const c = rng.pick(DISPATCH_CASES);
        const { correct, wrong } = pickFrom(DISPATCH, c.k);
        return choice(rng, {
          genId: "drill-rust-dispatch",
          prompt: `${c.task} What fits best?`,
          correct,
          wrong,
          explanation: `${c.why} See [The Book, §18.2](https://doc.rust-lang.org/book/ch18-02-trait-objects.html) for trait objects.`,
          docRef: L33,
        });
      },
    },
    {
      id: "drill-rust-trait-errors",
      title: "What does rustc say?",
      generate: (rng: Rng) => {
        const c = rng.pick(TRAIT_CASES);
        const { correct, wrong } = pickFrom(TRAIT_ERRORS, c.k);
        return choice(rng, {
          genId: "drill-rust-trait-errors",
          prompt: "What does rustc say?",
          code: c.code,
          codeLang: "rust",
          correct,
          wrong,
          explanation: `${c.why} See [The Book, §10.2](https://doc.rust-lang.org/book/ch10-02-traits.html).`,
          docRef: L33,
        });
      },
    },
  ],
};

/* ── Lesson 34: lifetimes ── */

const L34 = lessonRef("0034-lifetimes", "Lesson 34: lifetimes");

const ELISION = {
  only: "Compiles: tied to the input",
  self: "Compiles: tied to self's borrow",
  E0106: "E0106: the compiler can't choose",
  owned: "Compiles: no borrow is returned",
} as const;

const ELISION_CASES: { code: string; k: keyof typeof ELISION; why: string }[] = [
  { code: "fn first_word(s: &str) -> &str {\n    s.split(' ').next().unwrap_or(\"\")\n}", k: "only", why: "One reference parameter, so elision gives the output its lifetime (rule 2): the slice borrows from `s`." },
  { code: "fn longest(a: &str, b: &str) -> &str {\n    if a.len() >= b.len() { a } else { b }\n}", k: "E0106", why: "Two reference parameters and no `self`: no elision rule applies, and the compiler won't guess whether the result borrows from `a` or `b`. E0106; write `<'a>` on all three." },
  { code: "struct Scanner<'a> {\n    rest: &'a str,\n}\n\nimpl<'a> Scanner<'a> {\n    fn word(&mut self) -> Option<&str> {\n        let w = self.rest.split_whitespace().next()?;\n        Some(w)\n    }\n}", k: "self", why: "A method with `&mut self`: rule 3 ties every elided output lifetime to `self`'s borrow. It compiles, but each word now keeps the scanner borrowed: lesson 34's planted bug." },
  { code: "struct Config {\n    text: String,\n}\n\nimpl Config {\n    fn get(&self, key: &str) -> &str {\n        &self.text\n    }\n}", k: "self", why: "With `&self`, rule 3 ties the output to `self`, even though `key` is a reference too. Returning `key` would be refused; returning a slice of `self.text` is fine." },
  { code: "fn nth_char(s: &str, n: usize) -> &str {\n    &s[n..n + 1]\n}", k: "only", why: "`n` isn't a reference, so there's still exactly one input lifetime, and the output gets it." },
  { code: "fn name() -> &str {\n    \"judge\"\n}", k: "E0106", why: "No input lifetimes at all, so nothing to borrow from: E0106. If it's a literal, say so: `-> &'static str`." },
  { code: "fn upper(s: &str) -> String {\n    s.to_uppercase()\n}", k: "owned", why: "A `String` is owned: the caller gets its own value, and no lifetime connects it to `s`." },
  { code: "fn halves(s: &str) -> (&str, &str) {\n    s.split_at(s.len() / 2)\n}", k: "only", why: "Every elided lifetime in the output gets the single input's lifetime: both halves borrow from `s`." },
  { code: "fn join(a: &str, b: &str) -> String {\n    format!(\"{a} {b}\")\n}", k: "owned", why: "`format!` builds a new `String`, so the result borrows from neither input." },
];

const OUTLIVES = {
  ok: "Compiles: the borrow stays valid",
  E0597: "E0597: doesn't live long enough",
  E0515: "E0515: returns a local's reference",
  E0499: "E0499: two mutable borrows overlap",
} as const;

const OUTLIVES_CASES: { code: string; k: keyof typeof OUTLIVES; why: string }[] = [
  { code: "\nlet r;\n{\n    let s = String::from(\"x\");\n    r = &s;\n}\nprintln!(\"{r}\");", k: "E0597", why: "`s` is dropped at the inner brace, but `r` is used after it: E0597, `s` does not live long enough." },
  { code: "\nlet s = String::from(\"x\");\nlet r;\n{\n    r = &s;\n}\nprintln!(\"{r}\");", k: "ok", why: "`s` lives in the outer scope, so it outlives `r`'s last use." },
  { code: "\nlet r;\n{\n    let s = \"a literal\";\n    r = s;\n}\nprintln!(\"{r}\");", k: "ok", why: "A string literal is a `&'static str`, stored in the binary: it never dies, so `r` may outlive the block." },
  { code: "fn make() -> &'static str {\n    \"judge\"\n}\n\nprintln!(\"{}\", make());", k: "ok", why: "Returning a literal as `&'static str` is fine: it lives for the whole program." },
  { code: "fn make() -> &'static str {\n    let s = String::from(\"judge\");\n    &s\n}\n\nprintln!(\"{}\", make());", k: "E0515", why: "`s` is a local String, dropped at return: a reference to it would dangle. E0515. Return the `String` instead." },
  { code: "struct Scanner<'a> {\n    rest: &'a str,\n}\n\nimpl<'a> Scanner<'a> {\n    fn word(&mut self) -> Option<&str> {\n        let w = self.rest.split_whitespace().next()?;\n        Some(w)\n    }\n}\n\nlet mut sc = Scanner { rest: \"alice bob\" };\nlet a = sc.word();\nlet b = sc.word();\nprintln!(\"{a:?} {b:?}\");", k: "E0499", why: "`word` ties each result to `&mut self` (elision rule 3), so `a` keeps `sc` mutably borrowed while `b` borrows it again: E0499. Returning `Option<&'a str>` ties it to the input instead." },
  { code: "struct Scanner<'a> {\n    rest: &'a str,\n}\n\nimpl<'a> Scanner<'a> {\n    fn word(&mut self) -> Option<&str> {\n        let w = self.rest.split_whitespace().next()?;\n        Some(w)\n    }\n}\n\nlet first;\n{\n    let mut sc = Scanner { rest: \"alice bob\" };\n    first = sc.word();\n}\nprintln!(\"{first:?}\");", k: "E0597", why: "With the elided signature, `first` borrows `sc` itself, and `sc` is dropped at the brace: E0597. With `&'a str`, it would borrow only the input, which lives on." },
  { code: "fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {\n    if a.len() >= b.len() { a } else { b }\n}\n\nlet one = String::from(\"judge\");\nlet result;\n{\n    let two = String::from(\"run\");\n    result = longest(&one, &two);\n}\nprintln!(\"{result}\");", k: "E0597", why: "`longest` returns something that lives as long as the shorter of its inputs, and `two` dies at the brace while `result` is used after: E0597. (The Book's own example, \u00a710.3.)" },
  { code: "fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {\n    if a.len() >= b.len() { a } else { b }\n}\n\nlet one = String::from(\"judge\");\n{\n    let two = String::from(\"run\");\n    let result = longest(&one, &two);\n    println!(\"{result}\");\n}", k: "ok", why: "`result` is used inside the block where both inputs are still alive." },
];

const lifetimesDrill: Drill = {
  id: "rust-lifetimes",
  title: "What does it borrow from?",
  blurb: "Which input a returned reference is tied to, and whether a borrow outlives what it points at.",
  generators: [
    {
      id: "drill-rust-elision",
      title: "Read the elided lifetime",
      generate: (rng: Rng) => {
        const c = rng.pick(ELISION_CASES);
        const { correct, wrong } = pickFrom(ELISION, c.k);
        return choice(rng, {
          genId: "drill-rust-elision",
          prompt: "No lifetimes are written here. What does the compiler make of the signature?",
          code: c.code,
          codeLang: "rust",
          correct,
          wrong,
          explanation: `${c.why} The three rules: [The Book, §10.3, Lifetime Elision](https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html#lifetime-elision).`,
          docRef: L34,
        });
      },
    },
    {
      id: "drill-rust-outlives",
      title: "Does the borrow outlive its owner?",
      generate: (rng: Rng) => {
        const c = rng.pick(OUTLIVES_CASES);
        const { correct, wrong } = pickFrom(OUTLIVES, c.k);
        return choice(rng, {
          genId: "drill-rust-outlives",
          prompt: "What does rustc say?",
          code: c.code,
          codeLang: "rust",
          correct,
          wrong,
          explanation: `${c.why} See [The Book, §10.3](https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html).`,
          docRef: L34,
        });
      },
    },
  ],
};

/* ── Lesson 35: iterators and closures ── */

const L35 = lessonRef("0035-iterators-and-maps", "Lesson 35: iterators and maps");

type Chain = { code: string; run: (v: number[], k: number) => string; why: string };
const some = (x: number | undefined) => (x === undefined ? "None" : `Some(${x})`);

const CHAINS: Chain[] = [
  { code: "v.iter().filter(|&&x| x % 2 == 0).count()", run: (v) => String(v.filter((x) => x % 2 === 0).length), why: "`filter` keeps the even values, `count` consumes the iterator and counts them. The `&&x` pattern unpacks the `&&i32` that `filter` passes." },
  { code: "v.iter().map(|x| x * 2).sum::<i32>()", run: (v) => String(v.reduce((a, x) => a + 2 * x, 0)), why: "`map` doubles each value lazily, `sum` drives the iterator and adds them." },
  { code: "v.iter().take_while(|&&x| x < k).count()", run: (v, k) => String(v.findIndex((x) => x >= k) === -1 ? v.length : v.findIndex((x) => x >= k)), why: "`take_while` stops at the first value that fails the test, even if later values would pass." },
  { code: "v.iter().skip(2).max()", run: (v) => some(Math.max(...v.slice(2))), why: "`skip(2)` drops the first two values; `max` returns an `Option`, `None` only for an empty iterator." },
  { code: "v.iter().position(|&x| x == k)", run: (v, k) => some(v.indexOf(k) === -1 ? undefined : v.indexOf(k)), why: "`position` returns the index of the first match, as `Option<usize>`: `None` when nothing matches." },
  { code: "v.windows(2).filter(|w| w[0] < w[1]).count()", run: (v) => String(v.slice(1).filter((x, i) => (v[i] as number) < x).length), why: "`windows(2)` yields every overlapping pair, so this counts the rises from one value to the next." },
  { code: "v.iter().rev().take(2).sum::<i32>()", run: (v) => String((v.at(-1) as number) + (v.at(-2) as number)), why: "`rev` walks from the end, `take(2)` keeps two values: the sum of the last two." },
  { code: "v.iter().filter(|&&x| x > k).map(|x| x * x).sum::<i32>()", run: (v, k) => String(v.filter((x) => x > k).reduce((a, x) => a + x * x, 0)), why: "Adaptors chain in order: keep the values above `k`, square them, add them. Nothing runs until `sum` pulls." },
  { code: "v.iter().enumerate().filter(|(i, _)| i % 2 == 0).map(|(_, x)| x).sum::<i32>()", run: (v) => String(v.filter((_, i) => i % 2 === 0).reduce((a, x) => a + x, 0)), why: "`enumerate` pairs each value with its index from 0; this keeps indexes 0, 2, 4… and adds their values." },
  { code: "v.iter().any(|&x| x == k)", run: (v, k) => String(v.includes(k)), why: "`any` stops at the first `true` and returns a `bool`." },
  { code: "v.iter().min_by_key(|&&x| (x - k).abs())", run: (v, k) => { let best = v[0] as number; for (const x of v) if (Math.abs(x - k) < Math.abs(best - k)) best = x; return some(best); }, why: "`min_by_key` compares by the key (distance to `k`); on a tie it returns the first such element." },
  { code: "v.iter().skip_while(|&&x| x < k).count()", run: (v, k) => String(v.findIndex((x) => x >= k) === -1 ? 0 : v.length - v.findIndex((x) => x >= k)), why: "`skip_while` drops values until the first that fails the test, then keeps everything after it." },
];

const CLOSURES = {
  fn: "Fn: it only reads captures",
  mut: "FnMut: it changes a capture",
  once: "FnOnce: it consumes a capture",
  none: "fn pointer: it captures nothing",
} as const;

const CLOSURE_CASES: { code: string; k: keyof typeof CLOSURES; why: string }[] = [
  { code: "let limit = 60;\nlet late = |minute: u32| minute > limit;", k: "fn", why: "It reads `limit` through a shared reference, so it can be called any number of times, even concurrently: `Fn`." },
  { code: "let mut count = 0;\nlet mut tick = || count += 1;", k: "mut", why: "It changes `count`, so it borrows it mutably and needs `&mut` access to be called: `FnMut`." },
  { code: "let name = String::from(\"casa\");\nlet consume = move || drop(name);", k: "once", why: "`drop(name)` moves the captured String out of the closure, so it can only run once: `FnOnce`." },
  { code: "let double = |x: i32| x * 2;", k: "none", why: "It captures nothing, so it coerces to a plain `fn(i32) -> i32` pointer (and implements all three closure traits)." },
  { code: "let mut log = Vec::new();\nlet mut push = |s: &str| log.push(s.to_string());", k: "mut", why: "`log.push` changes the captured Vec: `FnMut`." },
  { code: "let teams = vec![\"casa\", \"fes\"];\nlet first = || teams[0];", k: "fn", why: "It only reads `teams` (and `&str` is `Copy`): `Fn`." },
  { code: "let s = String::from(\"x\");\nlet give = || s;", k: "once", why: "Returning `s` moves it out of the closure; a second call would have nothing to return: `FnOnce`." },
  { code: "let s = String::from(\"x\");\nlet show = move || println!(\"{s}\");", k: "fn", why: "`move` makes the closure own `s`, but it only reads it, so it's still `Fn`. `move` decides how values are captured, not which trait the closure implements." },
];

const iteratorsDrill: Drill = {
  id: "rust-iterators",
  title: "Run the chain in your head",
  blurb: "Fresh vectors through iterator adaptors, and which closure trait a closure implements.",
  generators: [
    {
      id: "drill-rust-chain",
      title: "What does it print?",
      generate: (rng: Rng) => {
        const v = Array.from({ length: rng.int(5, 7) }, () => rng.int(1, 9));
        const k = rng.int(2, 8);
        const c = rng.pick(CHAINS);
        const answer = c.run(v, k);
        const alt = answer.startsWith("Some(") ? [answer, answer.replace("Some(", "Some(&")] : [answer];
        return text({
          genId: "drill-rust-chain",
          prompt: "What does `println!(\"{:?}\", …)` print for this expression?",
          code: `let v: Vec<i32> = vec![${v.join(", ")}];\nlet k: i32 = ${k};\n${c.code}`,
          codeLang: "rust",
          answers: alt,
          placeholder: "3, Some(7), None, true…",
          explanation: `${c.why} Here: \`${answer}\`. See [std::iter::Iterator](https://doc.rust-lang.org/std/iter/trait.Iterator.html).`,
          docRef: L35,
        });
      },
    },
    {
      id: "drill-rust-closure-trait",
      title: "Fn, FnMut or FnOnce?",
      generate: (rng: Rng) => {
        const c = rng.pick(CLOSURE_CASES);
        const { correct, wrong } = pickFrom(CLOSURES, c.k);
        return choice(rng, {
          genId: "drill-rust-closure-trait",
          prompt: "Which describes this closure best?",
          code: c.code,
          codeLang: "rust",
          correct,
          wrong,
          explanation: `${c.why} See [The Book, §13.1](https://doc.rust-lang.org/book/ch13-01-closures.html).`,
          docRef: L35,
        });
      },
    },
  ],
};

/* ── Lesson 36: processes in Rust ── */

const L36 = lessonRef("0036-processes-in-rust", "Lesson 36: run, in Rust");

const C_TO_RUST: { c: string; rust: string; why: string }[] = [
  { c: "`fork()` then `execvp()`", rust: "`Command::new(prog).args(rest).spawn()`", why: "`spawn` does fork and exec (or posix_spawn), and reports a failed exec as an `Err` in the parent." },
  { c: "`waitpid(pid, &status, WNOHANG)`", rust: "`child.try_wait()`", why: "`try_wait` returns `Ok(None)` while the child runs, `Ok(Some(status))` once it has ended, without blocking." },
  { c: "`waitpid(pid, &status, 0)`", rust: "`child.wait()`", why: "`wait` blocks until the child ends and reaps it, so no zombie is left." },
  { c: "`WEXITSTATUS(status)`", rust: "`status.code()`", why: "`code()` is `Some(exit code)`, or `None` when a signal killed the process." },
  { c: "`WTERMSIG(status)`", rust: "`status.signal()`", why: "`signal()` comes from the Unix extension trait `ExitStatusExt`: `Some(signal)` when a signal killed it." },
  { c: "`setpgid(0, 0)` in the child", rust: "`.process_group(0)`", why: "`CommandExt::process_group(0)` makes the child the leader of a new process group, before it execs." },
  { c: "`kill(pid, SIGKILL)`", rust: "`child.kill()`", why: "`Child::kill` sends SIGKILL to that one process. Its children survive, as in lesson 2." },
  { c: "`clock_gettime(CLOCK_MONOTONIC)`", rust: "`Instant::now()`", why: "`Instant` is a monotonic clock: it never jumps backwards, unlike the wall clock (lesson 2's trap)." },
  { c: "`pipe()` and `dup2()` for the child's stdout", rust: "`.stdout(Stdio::piped())`", why: "`Stdio::piped()` creates the pipe and wires the child's end; you read `child.stdout` (lesson 37)." },
];

const UNSAFE = {
  foreign: "Yes: it calls foreign C code",
  raw: "Yes: it dereferences a raw pointer",
  static: "Yes: it uses a mutable static",
  safe: "No: the compiler checks it all",
} as const;

const UNSAFE_CASES: { code: string; k: keyof typeof UNSAFE; why: string }[] = [
  { code: "let pgid: libc::pid_t = 4242;\nlibc::kill(-pgid, libc::SIGKILL);", k: "foreign", why: "`libc::kill` is a foreign C function: the compiler can't see what it does, so calling it needs `unsafe` (E0133 without). It's harmless here, but the promise is yours." },
  { code: "let x = 7;\nlet p = &x as *const i32;\nlet y = *p;", k: "raw", why: "Creating a raw pointer is safe; dereferencing one isn't, because nothing guarantees it points at live memory: E0133." },
  { code: "let x = 7;\nlet p = &x as *const i32;\nprintln!(\"{p:?}\");", k: "safe", why: "Creating a raw pointer (and printing its address) is safe. Only reading or writing through it needs `unsafe`." },
  { code: "static mut RUNS: u32 = 0;\n\nRUNS += 1;", k: "static", why: "A `static mut` can be changed by any thread at any time, so every access is `unsafe`: E0133. Use an atomic or a `Mutex` instead." },
  { code: "let child = std::process::Command::new(\"true\").spawn();", k: "safe", why: "`std::process::Command` wraps fork, exec and wait behind a safe API: no `unsafe` needed." },
  { code: "let me = libc::getpid();", k: "foreign", why: "Even a harmless C call like `getpid` goes through FFI, so it's `unsafe` (E0133). `std::process::id()` is the safe std equivalent." },
  { code: "let me = std::process::id();", k: "safe", why: "`std::process::id()` is std's safe wrapper around `getpid`." },
  { code: "let bytes = vec![104, 105];\nlet s = std::str::from_utf8(&bytes);", k: "safe", why: "`from_utf8` checks the bytes and returns a `Result`: safe. (`from_utf8_unchecked` skips the check, and is `unsafe`.)" },
  { code: "let v = vec![1, 2, 3];\nlet p = v.as_ptr();\nlet second = *p.add(1);", k: "raw", why: "`p.add(1)` computes an address; `*` reads through it, which the compiler can't check: E0133. `v[1]` is the safe, bounds-checked way." },
  { code: "static mut LAST_PID: i32 = 0;\n\nlet pid = LAST_PID;", k: "static", why: "Reading a `static mut` is `unsafe` too, since another thread could be writing it: E0133." },
];

const processDrill: Drill = {
  id: "rust-process",
  title: "From C syscalls to std::process",
  blurb: "Lesson 2's C calls in Rust, reading an ExitStatus, and what needs unsafe.",
  generators: [
    {
      id: "drill-rust-c-to-std",
      title: "The Rust for this C call",
      generate: (rng: Rng) => {
        const [c, ...others] = rng.sample(C_TO_RUST, 4);
        const pick = c as (typeof C_TO_RUST)[number];
        return choice(rng, {
          genId: "drill-rust-c-to-std",
          prompt: `In lesson 2's \`run.c\` you wrote ${pick.c}. What's the Rust for it?`,
          correct: pick.rust,
          wrong: others.map((o) => o.rust),
          explanation: `${pick.why} See [std::process](https://doc.rust-lang.org/std/process/index.html).`,
          docRef: L36,
        });
      },
    },
    {
      id: "drill-rust-exit-status",
      title: "Read the ExitStatus",
      generate: (rng: Rng) => {
        const bySignal = rng.chance(0.4);
        const code = rng.pick([0, 1, 3, 42, 255, 256, 300, 513]);
        const sig = rng.pick([6, 9, 11, 15, 24]);
        const ask = rng.pick(["code", "signal"] as const);
        const how = bySignal ? `was killed by signal ${sig}` : `called \`exit(${code})\` in C`;
        const answer = bySignal ? (ask === "code" ? "None" : `Some(${sig})`) : ask === "code" ? `Some(${code % 256})` : "None";
        const why = bySignal
          ? `A signal killed it, so there's no exit code: \`code()\` is \`None\` and \`signal()\` is \`Some(${sig})\`.`
          : `It exited by itself, so \`signal()\` is \`None\`, and \`code()\` keeps only the low 8 bits, as \`WEXITSTATUS\` does: ${code} becomes ${code % 256}.`;
        return text({
          genId: "drill-rust-exit-status",
          prompt: `The child ${how}. What does \`status.${ask}()\` return?`,
          answers: [answer],
          placeholder: "Some(…) or None",
          explanation: `${why} See [ExitStatus](https://doc.rust-lang.org/std/process/struct.ExitStatus.html).`,
          docRef: L36,
        });
      },
    },
    {
      id: "drill-rust-unsafe",
      title: "Does it need unsafe?",
      generate: (rng: Rng) => {
        const c = rng.pick(UNSAFE_CASES);
        const { correct, wrong } = pickFrom(UNSAFE, c.k);
        return choice(rng, {
          genId: "drill-rust-unsafe",
          prompt: "Does this need an `unsafe` block to compile?",
          code: c.code,
          codeLang: "rust",
          correct,
          wrong,
          explanation: `${c.why} See [The Book, §20.1: Unsafe Rust](https://doc.rust-lang.org/book/ch20-01-unsafe-rust.html).`,
          docRef: L36,
        });
      },
    },
  ],
};

/* ── Lesson 37: files and I/O ── */

const L37 = lessonRef("0037-files-and-io", "Lesson 37: files and I/O");

const IO_TOOLS: { task: string; tool: string; why: string }[] = [
  { task: "read a whole answer file into memory", tool: "`fs::read_to_string(path)`", why: "One call opens, reads and checks UTF-8, returning `io::Result<String>`." },
  { task: "list the files in a tests folder", tool: "`fs::read_dir(dir)`", why: "It yields `io::Result<DirEntry>` items, in an order that depends on the filesystem: sort them yourself." },
  { task: "read a big file line by line, without loading it all", tool: "`BufReader::new(file).lines()`", why: "`BufReader` reads in large chunks and hands out lines lazily, so memory stays small." },
  { task: "feed a file to a child process as its stdin", tool: "`Stdio::from(File::open(p)?)`", why: "`Stdio` implements `From<File>`: the child reads the file directly, with no copy through your process." },
  { task: "read at most N bytes from a pipe", tool: "`reader.take(n)`", why: "`Read::take` wraps a reader and reports end-of-file after `n` bytes: the output cap in one call." },
  { task: "print a hundred thousand lines quickly", tool: "`BufWriter::new(io::stdout().lock())`", why: "stdout is line-buffered, so each line is a write syscall; a `BufWriter` batches them, and the lock is taken once." },
  { task: "build the path of `10.out` inside the tests folder", tool: "`dir.join(name)`", why: "`Path::join` inserts the separator correctly, and handles absolute paths." },
  { task: "get the `10` out of `10.in`", tool: "`path.file_stem()`", why: "`file_stem` is the file name without its extension, as an `Option<&OsStr>`." },
  { task: "throw away a child's stderr", tool: "`.stderr(Stdio::null())`", why: "`Stdio::null()` connects the stream to `/dev/null`." },
];

const ioDrill: Drill = {
  id: "rust-io",
  title: "The std tool for the job",
  blurb: "Which std::fs, std::io or Stdio call does a task, and the ordering trap in test folders.",
  generators: [
    {
      id: "drill-rust-io-tool",
      title: "Pick the call",
      generate: (rng: Rng) => {
        const [first, ...rest] = rng.sample(IO_TOOLS, 4);
        const c = first as (typeof IO_TOOLS)[number];
        return choice(rng, {
          genId: "drill-rust-io-tool",
          prompt: `You need to ${c.task}. Which call?`,
          correct: c.tool,
          wrong: rest.map((r) => r.tool),
          explanation: `${c.why} See [std::fs](https://doc.rust-lang.org/std/fs/index.html) and [std::io](https://doc.rust-lang.org/std/io/index.html).`,
          docRef: L37,
        });
      },
    },
    {
      id: "drill-rust-file-order",
      title: "Sorted as strings",
      generate: (rng: Rng) => {
        const nums = rng.sample([1, 2, 3, 9, 10, 11, 12, 20, 100], rng.int(3, 4));
        const lexical = [...nums].sort((a, b) => (String(a) < String(b) ? -1 : 1));
        const shown = rng.shuffle(nums.map((n) => `${n}.in`));
        const answer = lexical.join(", ");
        return text({
          genId: "drill-rust-file-order",
          prompt: `\`read_dir\` returns ${shown.map((s) => `\`${s}\``).join(", ")}. You collect the file names as \`String\`s and \`sort()\` them. In what order do the test numbers come out? (comma-separated)`,
          answers: [answer, lexical.join(","), lexical.join(" ")],
          placeholder: "1, 10, 2",
          explanation: `Strings compare character by character, so \`"10.in"\` comes before \`"2.in"\` (\`'1' < '2'\`). The result is ${answer}; numerically it would be ${[...nums].sort((a, b) => a - b).join(", ")}. Parse the stem to a number and sort numbers. (And never trust \`read_dir\`'s own order: it depends on the filesystem.)`,
          docRef: L37,
        });
      },
    },
  ],
};

/* ── Lesson 38: threads ── */

const L38 = lessonRef("0038-threads", "Lesson 38: threads");

const THREADS = {
  ok: "Compiles: no race is possible",
  E0373: "E0373: thread outlives the borrow",
  E0277: "E0277: not safe across threads",
  E0499: "E0499: two threads mutate it",
} as const;

const THREAD_CASES: { code: string; k: keyof typeof THREADS; why: string }[] = [
  { code: "use std::thread;\n\nlet v = vec![1, 2, 3];\nlet h = thread::spawn(|| println!(\"{}\", v.len()));\nh.join().unwrap();", k: "E0373", why: "`thread::spawn` needs a closure that can live forever (`'static`), since the thread may outlive `main`'s locals; this one borrows `v`. E0373 suggests `move`." },
  { code: "use std::thread;\n\nlet v = vec![1, 2, 3];\nlet h = thread::spawn(move || println!(\"{}\", v.len()));\nh.join().unwrap();", k: "ok", why: "`move` gives the closure ownership of `v`, so nothing is borrowed: the thread can outlive the function safely." },
  { code: "use std::thread;\n\nlet v = vec![1, 2, 3];\nthread::scope(|s| {\n    s.spawn(|| println!(\"{}\", v.len()));\n});", k: "ok", why: "Scoped threads may borrow: `thread::scope` doesn't return until every thread it spawned has finished, so `v` outlives them all." },
  { code: "use std::rc::Rc;\nuse std::thread;\n\nlet shared = Rc::new(5);\nlet h = thread::spawn(move || println!(\"{shared}\"));\nh.join().unwrap();", k: "E0277", why: "`Rc` counts references without atomic operations, so two threads updating its count could corrupt it. It isn't `Send`: E0277. Use `Arc`." },
  { code: "use std::sync::Arc;\nuse std::thread;\n\nlet shared = Arc::new(5);\nlet h = thread::spawn(move || println!(\"{shared}\"));\nh.join().unwrap();", k: "ok", why: "`Arc` is the atomic version of `Rc`: its count is updated with atomic instructions, so it's `Send` and `Sync`." },
  { code: "use std::thread;\n\nlet mut v = Vec::new();\nthread::scope(|s| {\n    s.spawn(|| v.push(1));\n    s.spawn(|| v.push(2));\n});", k: "E0499", why: "Two threads both want `&mut v` at the same time: a data race, refused at compile time (E0499). A `Mutex<Vec<_>>` would serialize the pushes." },
  { code: "use std::sync::Mutex;\nuse std::thread;\n\nlet v = Mutex::new(Vec::new());\nthread::scope(|s| {\n    s.spawn(|| v.lock().unwrap().push(1));\n    s.spawn(|| v.lock().unwrap().push(2));\n});", k: "ok", why: "The `Mutex` hands out one `&mut` at a time through `lock()`, so both threads can share `&v` safely." },
  { code: "use std::cell::RefCell;\nuse std::thread;\n\nlet count = RefCell::new(0);\nthread::scope(|s| {\n    s.spawn(|| *count.borrow_mut() += 1);\n    s.spawn(|| *count.borrow_mut() += 1);\n});", k: "E0277", why: "`RefCell` checks borrows at runtime with a plain counter, not thread-safe, so it isn't `Sync` and can't be shared: E0277. `Mutex` is its thread-safe cousin." },
  { code: "use std::sync::atomic::{AtomicUsize, Ordering};\nuse std::thread;\n\nlet count = AtomicUsize::new(0);\nthread::scope(|s| {\n    s.spawn(|| count.fetch_add(1, Ordering::Relaxed));\n    s.spawn(|| count.fetch_add(1, Ordering::Relaxed));\n});", k: "ok", why: "Atomics are `Sync`: `fetch_add` is one indivisible instruction, so shared `&count` is safe." },
  { code: "use std::thread;\n\nlet mut total = 0;\nthread::scope(|s| {\n    s.spawn(|| total += 1);\n    s.spawn(|| total += 2);\n});", k: "E0499", why: "Two closures that both do `total += \u2026` each need `&mut total` at once: E0499. Return partial sums from the threads instead, or use an atomic." },
];

const SYNC_TOOLS: { task: string; tool: string; why: string }[] = [
  { task: "Eight threads count accepted submissions, as cheaply as possible.", tool: "`AtomicUsize`", why: "A counter is one number: `fetch_add` updates it with one atomic instruction, no lock needed." },
  { task: "Threads that outlive the function all read one shared, read-only config.", tool: "`Arc<T>`", why: "`Arc` gives each thread an owning pointer to the same value, freed when the last one drops. Read-only needs no lock." },
  { task: "Several threads append outcomes to one shared Vec.", tool: "`Mutex<T>`", why: "Appending changes the Vec, so threads must take turns: `lock()` hands out one `&mut` at a time." },
  { task: "Workers hand each finished outcome to one collecting thread.", tool: "`mpsc::channel()`", why: "A channel moves values from many senders to one receiver: no shared state at all. As The Book quotes the Go docs: \"Do not communicate by sharing memory; instead, share memory by communicating.\"" },
  { task: "Threads borrow local data and must all finish before the function returns.", tool: "`thread::scope`", why: "Scoped threads can borrow from the enclosing function, because the scope joins them all before it returns." },
];

const threadsDrill: Drill = {
  id: "rust-threads",
  title: "Send, Sync, and the right tool",
  blurb: "Which thread code compiles and why, and which synchronization tool fits a job.",
  generators: [
    {
      id: "drill-rust-thread-errors",
      title: "Does it compile?",
      generate: (rng: Rng) => {
        const c = rng.pick(THREAD_CASES);
        const { correct, wrong } = pickFrom(THREADS, c.k);
        return choice(rng, {
          genId: "drill-rust-thread-errors",
          prompt: "What does rustc say?",
          code: c.code,
          codeLang: "rust",
          correct,
          wrong,
          explanation: `${c.why} See [The Book, chapter 16](https://doc.rust-lang.org/book/ch16-00-concurrency.html).`,
          docRef: L38,
        });
      },
    },
    {
      id: "drill-rust-sync-tool",
      title: "Pick the tool",
      generate: (rng: Rng) => {
        const [first, ...rest] = rng.sample(SYNC_TOOLS, 4);
        const c = first as (typeof SYNC_TOOLS)[number];
        return choice(rng, {
          genId: "drill-rust-sync-tool",
          prompt: `${c.task} Which tool?`,
          correct: c.tool,
          wrong: rest.map((r) => r.tool),
          explanation: `${c.why} See [std::sync](https://doc.rust-lang.org/std/sync/index.html).`,
          docRef: L38,
        });
      },
    },
  ],
};

/* ── Lesson 39: async ── */

const L39 = lessonRef("0039-async-tokio", "Lesson 39: async with tokio");

const MODELS = {
  async: "Async tasks on tokio",
  threads: "OS threads, or rayon",
  blocking: "spawn_blocking inside async code",
  plain: "One thread, no concurrency",
} as const;

const MODEL_CASES: { task: string; k: keyof typeof MODELS; why: string }[] = [
  { task: "A server holds 10,000 WebSocket connections, mostly idle.", k: "async", why: "Each idle connection is a few hundred bytes of task state, not a thread with its own stack. Waiting is what async is for." },
  { task: "Fetch 500 URLs, each waiting about 200 ms on the network.", k: "async", why: "The work is waiting: 500 tasks on a few threads finish in roughly the time of the slowest request." },
  { task: "Hash 8 GB of test data as fast as the cores allow.", k: "threads", why: "CPU-bound work needs cores, not waiting: one thread per core (rayon does it for you). Async adds nothing here." },
  { task: "A ray tracer must keep every core at 100%.", k: "threads", why: "Pure computation: threads, one per core. Async helps only when tasks spend their time waiting." },
  { task: "An async API handler must compress a 50 MB upload.", k: "blocking", why: "Compression blocks a thread for a long time. On a runtime thread it would stall every other task, so hand it to `spawn_blocking` and `.await` the result." },
  { task: "An async server must call a C library that blocks for seconds.", k: "blocking", why: "A blocking call inside async code freezes its runtime thread. `spawn_blocking` moves it to a pool meant for that." },
  { task: "A CLI reads one file and prints how many lines it has.", k: "plain", why: "One input, one output, nothing to overlap: concurrency would only add code." },
  { task: "Parse a 2 KB config file once, at startup.", k: "plain", why: "It takes microseconds and happens once: no concurrency needed." },
];

type TimingShape = { code: (a: number, b: number, n: number) => string; ms: (a: number, b: number, n: number) => number; why: string };
const TIMINGS: TimingShape[] = [
  { code: (a, b) => `wait(${a}).await;\nwait(${b}).await;`, ms: (a, b) => a + b, why: "`.await` waits for each future before the next line starts: sequential, so the times add up." },
  { code: (a, b) => `tokio::join!(wait(${a}), wait(${b}));`, ms: (a, b) => Math.max(a, b), why: "`join!` polls both futures together and finishes when the slower one does: the maximum." },
  { code: (a, b) => `tokio::select! {\n    _ = wait(${a}) => {}\n    _ = wait(${b}) => {}\n}`, ms: (a, b) => Math.min(a, b), why: "`select!` finishes with the first branch to complete and drops (cancels) the other: the minimum." },
  { code: (a, b) => `let _ = timeout(Duration::from_millis(${b}), wait(${a})).await;`, ms: (a, b) => Math.min(a, b), why: "`timeout` returns `Ok` if the future finishes first, or `Err(Elapsed)` at the deadline, dropping it." },
  { code: (a, _b, n) => `for _ in 0..${n} {\n    wait(${a}).await;\n}`, ms: (a, _b, n) => a * n, why: "Each iteration awaits before the next begins: n times the duration." },
  { code: (a, _b, n) => `let mut set = JoinSet::new();\nfor _ in 0..${n} {\n    set.spawn(wait(${a}));\n}\nset.join_all().await;`, ms: (a) => a, why: "Spawned tasks run concurrently; `join_all` waits for all of them, which takes as long as one." },
];

const asyncDrill: Drill = {
  id: "rust-async",
  title: "When async, and how long",
  blurb: "Async, threads or spawn_blocking for a job, and how long await, join!, select! and timeout take.",
  generators: [
    {
      id: "drill-rust-async-model",
      title: "Pick the model",
      generate: (rng: Rng) => {
        const c = rng.pick(MODEL_CASES);
        const { correct, wrong } = pickFrom(MODELS, c.k);
        return choice(rng, {
          genId: "drill-rust-async-model",
          prompt: `${c.task} What fits?`,
          correct,
          wrong,
          explanation: `${c.why} See [the tokio tutorial: when not to use tokio](https://tokio.rs/tokio/tutorial).`,
          docRef: L39,
        });
      },
    },
    {
      id: "drill-rust-async-time",
      title: "How long does it take?",
      generate: (rng: Rng) => {
        const s = rng.pick(TIMINGS);
        const a = rng.pick([100, 150, 200, 250, 300, 400]);
        const b = rng.pick([50, 100, 200, 300, 500]);
        const n = rng.int(2, 5);
        const ms = s.ms(a, b, n);
        return text({
          genId: "drill-rust-async-time",
          prompt: "With `async fn wait(ms: u64) { sleep(Duration::from_millis(ms)).await }`, how many milliseconds does this take?",
          code: s.code(a, b, n),
          codeLang: "rust",
          answers: [String(ms), `${ms} ms`, `${ms}ms`],
          placeholder: "milliseconds",
          explanation: `${s.why} Here: ${ms} ms. See [tokio::join!](https://docs.rs/tokio/latest/tokio/macro.join.html) and [tokio::select!](https://docs.rs/tokio/latest/tokio/macro.select.html).`,
          docRef: L39,
        });
      },
    },
  ],
};

/* ── Lesson 40: BPE ── */

const L40 = lessonRef("0040-bpe-tokenizer", "Lesson 40: a BPE tokenizer");

/** Adjacent pairs, overlapping, counted; ties broken towards the smallest pair, as in the lab. */
function bestPair(s: string): { pair: string; count: number; counts: [string, number][] } {
  const counts = new Map<string, number>();
  for (let i = 0; i + 1 < s.length; i++) counts.set(s.slice(i, i + 2), (counts.get(s.slice(i, i + 2)) ?? 0) + 1);
  const sorted = [...counts.entries()].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1));
  const [pair, count] = sorted[0] ?? ["", 0];
  return { pair, count, counts: sorted };
}

/** Non-overlapping, left to right: how many tokens remain after merging `pair`. */
function mergedLength(s: string, pair: string): number {
  let n = 0;
  for (let i = 0; i < s.length; ) {
    if (s.slice(i, i + 2) === pair) i += 2;
    else i += 1;
    n++;
  }
  return n;
}

const bpeDrill: Drill = {
  id: "rust-bpe",
  title: "Train BPE by hand",
  blurb: "Which pair BPE merges first, and how many tokens are left after a merge.",
  generators: [
    {
      id: "drill-rust-bpe-first",
      title: "The first merge",
      generate: (rng: Rng) => {
        let s = "";
        let best = bestPair(s);
        while (best.count < 2) {
          s = Array.from({ length: rng.int(7, 10) }, () => rng.pick(["a", "b", "c"])).join("");
          best = bestPair(s);
        }
        const tied = best.counts.filter(([, c]) => c === best.count).map(([p]) => p);
        const tie = tied.length > 1 ? ` ${tied.join(", ")} all occur ${best.count} times, so the tie goes to the smallest pair: ${best.pair}.` : "";
        return text({
          genId: "drill-rust-bpe-first",
          prompt: `BPE trains on the bytes of \`"${s}"\`. Which pair does it merge first? (two letters, like \`ab\`)`,
          answers: [best.pair, `${best.pair[0]} ${best.pair[1]}`, `(${best.pair[0]}, ${best.pair[1]})`, `(${best.pair[0]},${best.pair[1]})`],
          placeholder: "ab",
          explanation: `Count every adjacent pair, overlaps included: ${best.counts.map(([p, c]) => `${p}×${c}`).join(", ")}. The most frequent wins.${tie} See [minbpe](https://github.com/karpathy/minbpe) for the same algorithm in Python.`,
          docRef: L40,
        });
      },
    },
    {
      id: "drill-rust-bpe-merge",
      title: "Tokens after a merge",
      generate: (rng: Rng) => {
        const s = Array.from({ length: rng.int(6, 10) }, () => rng.pick(["a", "a", "b", "c"])).join("");
        const pair = rng.pick(["aa", "ab", "ba", "ca"]);
        const n = mergedLength(s, pair);
        return numeric({
          genId: "drill-rust-bpe-merge",
          prompt: `The text \`"${s}"\` is ${s.length} tokens (one per byte). After merging the pair \`${pair}\` (left to right, no overlap), how many tokens are left?`,
          answer: n,
          explanation: `Scan left to right; each match of \`${pair}\` becomes one token and the scan jumps past both. ${s.length} − ${s.length - n} = ${n}. Overlap matters: \`aaa\` holds only one non-overlapping \`aa\`.`,
          docRef: L40,
        });
      },
    },
  ],
};

/* ── Lesson 41: PyO3 ── */

const L41 = lessonRef("0041-pyo3-extension", "Lesson 41: Rust inside Python");

const PY_TYPES: { py: string; rust: string; why: string }[] = [
  { py: "a `str` argument, only read", rust: "`&str`", why: "PyO3 borrows the Python string's UTF-8 data; `String` also works, at the cost of a copy." },
  { py: "a `bytes` argument, only read", rust: "`&[u8]`", why: "`bytes` maps to a byte slice; `Vec<u8>` works too, with a copy." },
  { py: "a `list[int]` argument", rust: "`Vec<u32>`", why: "A Python list is converted element by element into a `Vec`; each `int` must fit the integer type, or the call raises." },
  { py: "an `int | None` argument", rust: "`Option<i64>`", why: "`None` becomes `None`, an `int` becomes `Some(n)`." },
  { py: "a `float` argument", rust: "`f64`", why: "Python floats are IEEE doubles, exactly an `f64`." },
  { py: "a `bool` argument", rust: "`bool`", why: "Python's `True` and `False` map to Rust's `bool`." },
];

const GIL_CHOICE = {
  detach: "Release it: long pure-Rust work",
  touches: "Keep it: touches Python objects",
  quick: "Keep it: far too quick",
  always: "Release it, on every call",
} as const;

const GIL_CASES: { task: string; k: keyof typeof GIL_CHOICE; why: string }[] = [
  { task: "encodes a 100 MB string, already borrowed as `&str`, into tokens", k: "detach", why: "Hundreds of milliseconds of pure Rust work: release the GIL with `py.detach(|| …)` so other Python threads keep running." },
  { task: "hashes 10,000 buffers already copied into a `Vec<Vec<u8>>`", k: "detach", why: "Long, CPU-bound, and touching only Rust data: the textbook case for `py.detach`." },
  { task: "returns `len(self.merges)`", k: "quick", why: "Releasing and re-acquiring the GIL costs more than this whole call. Keep it." },
  { task: "returns a cached integer field", k: "quick", why: "Nanoseconds of work: detaching would be pure overhead." },
  { task: "builds a Python `dict` of every token's bytes", k: "touches", why: "Creating Python objects needs the interpreter, so the GIL must be held (attached). Build Rust data detached, then convert at the end if it's big." },
  { task: "reads an attribute from a Python object passed in", k: "touches", why: "Any access to a Python object requires holding the GIL. Copy what you need out first, then detach for the heavy part." },
];

const pyo3Drill: Drill = {
  id: "rust-pyo3",
  title: "Across the Python boundary",
  blurb: "Which Rust type receives a Python value, and when a PyO3 function should release the GIL.",
  generators: [
    {
      id: "drill-rust-pyo3-type",
      title: "Python in, Rust type",
      generate: (rng: Rng) => {
        const [first, ...rest] = rng.sample(PY_TYPES, 4);
        const c = first as (typeof PY_TYPES)[number];
        return choice(rng, {
          genId: "drill-rust-pyo3-type",
          prompt: `A \`#[pyfunction]\` takes ${c.py}. Which Rust parameter type fits?`,
          correct: c.rust,
          wrong: rest.map((r) => r.rust),
          explanation: `${c.why} See [PyO3's conversion tables](https://pyo3.rs/latest/conversions/tables.html).`,
          docRef: L41,
        });
      },
    },
    {
      id: "drill-rust-pyo3-gil",
      title: "Release the GIL?",
      generate: (rng: Rng) => {
        const c = rng.pick(GIL_CASES);
        const { correct, wrong } = pickFrom(GIL_CHOICE, c.k);
        return choice(rng, {
          genId: "drill-rust-pyo3-gil",
          prompt: `A PyO3 method ${c.task}. Should it release the GIL?`,
          correct,
          wrong,
          explanation: `${c.why} See [PyO3: parallelism](https://pyo3.rs/latest/parallelism.html).`,
          docRef: L41,
        });
      },
    },
  ],
};

/* ── Lesson 42: parallel and shipped ── */

const L42 = lessonRef("0042-parallel-and-shipped", "Lesson 42: parallel, measured, shipped");

const CARGO_TOOLS: { task: string; tool: string; why: string }[] = [
  { task: "A pull request mixes two indentation styles and long lines.", tool: "`cargo fmt`", why: "rustfmt formats to one standard style; `cargo fmt --check` fails CI when a file isn't formatted, so style never reaches code review." },
  { task: "A function takes `&String` where `&str` would do.", tool: "`cargo clippy`", why: "Clippy is Rust's linter, with hundreds of lints; this one is `ptr_arg`. `-- -D warnings` turns every warning into a failing error." },
  { task: "A refactor broke how verdicts are computed.", tool: "`cargo test`", why: "Unit tests next to the code and integration tests in `tests/` run with one command." },
  { task: "You need a trustworthy timing of the hot loop.", tool: "`cargo bench`", why: "Benchmarks build with optimizations and run many iterations; a debug build's timing means little." },
  { task: "A dependency has a published security advisory.", tool: "`cargo audit`", why: "cargo-audit (`cargo install cargo-audit`) checks `Cargo.lock` against the RustSec advisory database." },
];

const PARALLEL = {
  yes: "Yes: the pieces are independent",
  dep: "No: steps depend on predecessors",
  small: "No: too little work overall",
  io: "No: one ordered output stream",
} as const;

const PARALLEL_CASES: { task: string; k: keyof typeof PARALLEL; why: string }[] = [
  { task: "Encode 10,000 independent texts with one tokenizer.", k: "yes", why: "Each text is encoded on its own, reading shared, unchanging merges: the ideal data-parallel job." },
  { task: "Count the words in a million documents already in memory.", k: "yes", why: "Independent per-document work followed by a sum: `par_iter().map(count).sum()`." },
  { task: "BPE training: each merge is chosen from the counts left by the previous one.", k: "dep", why: "Every step needs the previous step's result, so the steps can't run side by side. (Counting the pairs within one step can be parallel.)" },
  { task: "Compute a running balance where each line adds to the last total.", k: "dep", why: "A sequential dependency: line n needs the total after line n − 1." },
  { task: "Add up 100 small integers.", k: "small", why: "Splitting the work across threads costs more than adding 100 numbers. Parallelism pays only when each piece is big enough." },
  { task: "Print each verdict line to stdout, in test order.", k: "io", why: "One output, in a fixed order: threads would contend for it and scramble the order. Compute in parallel if needed, then print sequentially." },
];

const shipDrill: Drill = {
  id: "rust-ship",
  title: "Ship it like a team",
  blurb: "Which cargo tool catches what, and when par_iter actually helps.",
  generators: [
    {
      id: "drill-rust-cargo-tool",
      title: "Which tool catches it?",
      generate: (rng: Rng) => {
        const [first, ...rest] = rng.sample(CARGO_TOOLS, 4);
        const c = first as (typeof CARGO_TOOLS)[number];
        return choice(rng, {
          genId: "drill-rust-cargo-tool",
          prompt: `${c.task} Which tool catches it?`,
          correct: c.tool,
          wrong: rest.map((r) => r.tool),
          explanation: `${c.why} See [the Cargo book](https://doc.rust-lang.org/cargo/).`,
          docRef: L42,
        });
      },
    },
    {
      id: "drill-rust-par-iter",
      title: "Will par_iter help?",
      generate: (rng: Rng) => {
        const c = rng.pick(PARALLEL_CASES);
        const { correct, wrong } = pickFrom(PARALLEL, c.k);
        return choice(rng, {
          genId: "drill-rust-par-iter",
          prompt: `${c.task} Will rayon's \`par_iter\` speed it up?`,
          correct,
          wrong,
          explanation: `${c.why} See [rayon](https://docs.rs/rayon/latest/rayon/).`,
          docRef: L42,
        });
      },
    },
  ],
};

export const RUST_DRILLS: Drill[] = [basicsDrill, ownershipDrill, borrowingDrill, matchDrill, errorsDrill, traitsDrill, lifetimesDrill, iteratorsDrill, processDrill, ioDrill, threadsDrill, asyncDrill, bpeDrill, pyo3Drill, shipDrill];
