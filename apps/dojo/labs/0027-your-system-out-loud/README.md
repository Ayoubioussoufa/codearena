# Lab 0027: CodeArena on a blank page, then at 100×

Write **`outline.md`**: the notes you'd speak from in a system-design interview
where the question is *"Design an online judge like the one you built."*

## The scenario at 100×

- 20,000 daily active users, 10 submissions each per day
- the peak hour is 10× the average rate
- a submission runs 5 tests of about 1 second each, one after another, in one
  container that takes 1 more second to start: **6 seconds of one runner slot**
- a stored submission (code + row) is about 5 KB
- the leaderboard page is viewed 50 times per submission

## The required sections, in this order

Each heading ends with the minutes you'll spend on it out loud, like
`## Requirements (1 min)`. The total must be 15 minutes or less.

1. `## Requirements`: functional and non-functional, with numbers (latency, availability…)
2. `## Capacity`: exactly these five lines, numbers only (the checker recomputes them, ±15%):

        - average submissions per second: …
        - peak submissions per second: …
        - runner slots needed at peak: …
        - new submission data per year (GB): …
        - peak leaderboard views per second: …

3. `## API`: the main endpoints, at least four
4. `## Data model`: the main tables, at least three
5. `## Design`: the components, with a diagram in a fenced code block (` ```mermaid ` or ` ```text `)
6. `## The judge, in depth`: the part you know best
7. `## At 100×`: at least four lines `- <bottleneck>: <what you change>`
8. `## Trade-offs`: at least three lines, each saying what you chose **instead of**
   (or **rather than**) what, and **because** why

Then `bash check.sh`.
