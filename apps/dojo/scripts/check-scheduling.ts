/**
 * Unit checks for the spaced-repetition math (pure functions from progress.ts).
 *   pnpm dlx tsx scripts/check-scheduling.ts
 */
import { scheduleAfter, isDue, dueList } from "../src/lib/progress";
import type { Progress } from "../src/lib/progress";

let failures = 0;
function eq(actual: unknown, expected: unknown, label: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    failures++;
    console.error(`✗ ${label}: got ${a}, expected ${e}`);
  } else {
    console.log(`✓ ${label}`);
  }
}

const T = "2026-07-17";

// Interval ladder on repeated correct reviews.
eq(scheduleAfter(0, true, T), { stability: 1, due: "2026-07-18", last: T }, "new+correct → 1 day");
eq(scheduleAfter(1, true, T).stability, 2, "1 → round(2.2) = 2");
eq(scheduleAfter(2, true, T).stability, 4, "2 → round(4.4) = 4");
eq(scheduleAfter(10, true, T).stability, 22, "10 → round(22) = 22");
eq(scheduleAfter(80, true, T).stability, 120, "80 → capped at 120");
eq(scheduleAfter(10, true, T).due, "2026-08-08", "10-day interval lands 22 days out");

// A miss resets to due-now (relearn).
eq(scheduleAfter(40, false, T), { stability: 0, due: T, last: T }, "miss → due today, stability 0");

// isDue semantics.
eq(isDue({ attempts: 0, correct: 0 }, T), false, "unseen item is never 'due'");
eq(isDue({ attempts: 3, correct: 3, due: "2026-07-16" }, T), true, "past due → due");
eq(isDue({ attempts: 3, correct: 3, due: "2026-07-17" }, T), true, "due today → due");
eq(isDue({ attempts: 3, correct: 3, due: "2026-07-20" }, T), false, "future → not due");
// Unscheduled (no due date, e.g. after resetReviews) is NOT due: see isDue in progress.ts.
eq(isDue({ attempts: 1, correct: 0 }, T), false, "seen but unscheduled item (no due date) → not due");

// dueList ordering: most overdue first, unseen excluded.
const progress: Progress = {
  topics: {
    react: {
      attempts: 3,
      correct: 3,
      generators: {
        a: { attempts: 1, correct: 1, due: "2026-07-15" }, // 2 days overdue
        b: { attempts: 1, correct: 1, due: "2026-07-17" }, // due today
        c: { attempts: 1, correct: 1, due: "2026-07-25" }, // future — excluded
        d: { attempts: 0, correct: 0 }, // unseen — excluded
      },
    },
  },
  totalAttempts: 3,
  totalCorrect: 3,
  streak: { current: 1, best: 1, lastDate: T },
};
const due = dueList(progress, T);
eq(due.map((d) => d.genId), ["a", "b"], "dueList: only a,b — most overdue first");
eq(due[0]?.overdueDays, -2, "a is 2 days overdue");

if (failures > 0) {
  console.error(`\n${failures} FAILURES`);
  process.exit(1);
}
console.log("\nAll scheduling checks pass. ✓");
