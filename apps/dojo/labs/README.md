# Labs

One folder per lesson (`/courses` in the dojo). Each holds a **kit**: test programs, starter
files when needed, and a `check.sh` that grades your work. You write the files the lesson asks
for; they're git-ignored, so your attempts stay yours and never land in a commit.

```bash
cd apps/dojo/labs/<lesson>
bash check.sh        # build and grade
```

Checkers are tested against a reference solution that is never committed.

