#!/usr/bin/env python3
"""author-guide-checks.py <spec.txt> [--emit]: authoring helper for guide checks (src/lib/guide-checks).
Usage: python3 scripts/author-guide-checks.py my-guide.txt [--emit]

Validate a guide-check spec; with --emit, write the TS file,
register it in index.ts and place the ```check fences in the guide.

Spec format:
    slug: react-fundamentals
    name: React guide
    const: reactChecks
    file: content/supplements/react-fundamentals.md      (relative to apps/dojo)
    checked: one line for the TS header comment
    source.label: …
    source.href: https://…
    source.note: …
    terms: A | B | C

    == check <id> | <section> | <regex: insert the fence before the first match>
    Q: prompt
    + the right option
    - a wrong option (three of them)
    W: why
    E: the written question (once per check, anywhere in it)
The right option's position rotates automatically so it varies across the guide.
"""
import json, re, sys, pathlib

DOJO = pathlib.Path(__file__).resolve().parent.parent
PERM = [1, 3, 0, 2, 2, 0, 3, 1, 0, 2, 1, 3]

def parse(text):
    meta, checks, cur, q = {}, [], None, None
    for raw in text.split("\n"):
        line = raw.rstrip()
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line.startswith("== check "):
            parts = [p.strip() for p in line[len("== check "):].split(" | ")]
            cur = {"id": parts[0], "section": parts[1], "before": parts[2], "questions": [], "explain": None}
            checks.append(cur); q = None
        elif cur is None:
            k, v = line.split(":", 1); meta[k.strip()] = v.strip()
        elif line.startswith("Q: "):
            q = {"prompt": line[3:], "right": None, "wrong": [], "why": None}; cur["questions"].append(q)
        elif line.startswith("+ "):
            q["right"] = line[2:]
        elif line.startswith("- "):
            q["wrong"].append(line[2:])
        elif line.startswith("W: "):
            q["why"] = line[3:]
        elif line.startswith("E: "):
            cur["explain"] = line[3:]
        else:
            raise SystemExit(f"unparsed line: {line!r}")
    return meta, checks

def validate(meta, checks):
    errs, n = [], 0
    for c in checks:
        if not c["explain"] or len(c["explain"]) < 40: errs.append(f"{c['id']}: missing or short E:")
        if not 2 <= len(c["questions"]) <= 4: errs.append(f"{c['id']}: {len(c['questions'])} questions")
        for i, q in enumerate(c["questions"]):
            where = f"{c['id']} q{i+1}"
            opts = [q["right"]] + q["wrong"]
            if q["right"] is None or len(q["wrong"]) != 3: errs.append(f"{where}: needs 1 right + 3 wrong"); continue
            w = [len(o.split()) for o in opts]; ch = [len(o) for o in opts]
            if len(set(w)) != 1: errs.append(f"{where}: words {w}  (right first)\n" + "\n".join(f"      {len(o.split()):>2}w {len(o):>3}c  {o}" for o in opts))
            if max(ch) / min(ch) > 1.2: errs.append(f"{where}: chars {ch} ratio {max(ch)/min(ch):.2f}; need min >= {max(ch)/1.2:.0f} or max <= {min(ch)*1.2:.0f}")
            if ch[0] > max(ch[1:]) + 3: errs.append(f"{where}: right is longest {ch}")
            if len(set(opts)) != 4: errs.append(f"{where}: duplicate options")
            if not q["why"] or len(q["why"]) < 60: errs.append(f"{where}: why too short")
            n += 1
    for k in ["slug", "name", "const", "file", "source.label", "source.href", "source.note", "terms"]:
        if k not in meta: errs.append(f"meta {k} missing")
    if "terms" in meta and len(meta["terms"].split(" | ")) < 4: errs.append("fewer than 4 terms")
    return errs, n

def emit(meta, checks):
    j = lambda s: json.dumps(s, ensure_ascii=False)
    out = ["/**", f" * Checks for {meta['file']}.", f" * {meta.get('checked', 'Claims checked against primary sources.')}", " * Generated from a spec; edit freely.", " */",
           'import type { GuideCheckSet } from "./types";', "", f"export const {meta['const']}: GuideCheckSet = {{",
           f"  name: {j(meta['name'])},", "  source: {", f"    label: {j(meta['source.label'])},", f"    href: {j(meta['source.href'])},",
           f"    note: {j(meta['source.note'])},", "  },", "  terms: ["]
    out += [f"    {j(t)}," for t in meta["terms"].split(" | ")]
    out += ["  ],", "  checks: ["]
    k = 0
    for c in checks:
        out += ["    {", f"      id: {j(c['id'])},", f"      section: {j(c['section'])},", "      questions: ["]
        for q in c["questions"]:
            pos = PERM[k % len(PERM)]; k += 1
            opts = list(q["wrong"]); opts.insert(pos, q["right"])
            out += ["        {", f"          prompt: {j(q['prompt'])},", "          options: ["]
            out += [f"            {j(o)}," for o in opts]
            out += ["          ],", f"          correct: {pos},", f"          why: {j(q['why'])},", "        },"]
        out += ["      ],", f"      explain: {j(c['explain'])},", "    },"]
    out += ["  ],", "};", ""]
    ts = DOJO / "src/lib/guide-checks" / f"{meta['slug']}.ts"
    ts.write_text("\n".join(out))
    idx = DOJO / "src/lib/guide-checks/index.ts"; s = idx.read_text()
    imp = f'import {{ {meta["const"]} }} from "./{meta["slug"]}";\n'
    if imp not in s:
        last = list(re.finditer(r'^import \{ \w+ \} from "\./[\w-]+";\n', s, re.M))[-1]
        s = s[:last.end()] + imp + s[last.end():]
        key = meta["slug"] if re.fullmatch(r"[a-z]\w*", meta["slug"]) else j(meta["slug"])
        s = s.replace("\n};\n", f"\n  {key}: {meta['const']},\n}};\n", 1)
        idx.write_text(s)
    md = DOJO / meta["file"]; t = md.read_text()
    for c in checks:
        fence = f"```check\n{c['id']}\n```\n"
        if fence in t: continue
        m = re.search(c["before"], t, re.M)
        if not m: raise SystemExit(f"{c['id']}: pattern {c['before']!r} not found")
        at = m.start()
        t = t[:at] + "\n" + fence + "\n" + t[at:]
    md.write_text(t)
    print(f"emitted {ts.name}, registered, fences placed in {md.name}")

if __name__ == "__main__":
    meta, checks = parse(pathlib.Path(sys.argv[1]).read_text())
    errs, n = validate(meta, checks)
    for c in checks:
        m = re.search(c["before"], (DOJO / meta["file"]).read_text(), re.M) if "file" in meta else None
        if not m: errs.append(f"{c['id']}: placement pattern not found: {c['before']}")
    print(f"{len(checks)} checks, {n} questions; {len(errs)} problem(s)")
    for e in errs: print("  " + e)
    if errs: sys.exit(1)
    if "--emit" in sys.argv: emit(meta, checks)
