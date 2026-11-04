# My six stories

<!--
  cp stories.start.md stories.md, then write stories 1 to 6 below the example.
  Each story: the five labelled parts, in this order, one paragraph each.
  Write the way you speak: short sentences, "I", real numbers.
  bash check.sh tells you each story's spoken length, and what an interviewer would miss.
-->

## Example: a slow page (not yours; delete it once you've read it)

**Situation:** In my second year at 42, our team's school-events site took eight seconds to load the events page, and students were complaining in the Slack channel.

**Task:** I offered to find out why and make it fast, without rewriting the site, because the exam period started the next week.

**Action:** First I measured instead of guessing. I opened the browser's network tab and saw one request taking seven of the eight seconds. I read the server log for that request and found two hundred database queries: the page loaded the events, then the organiser of each event, one query at a time. I rewrote it as one query with a join, and I added an index on the event date, because the page always sorted by it. I checked the query plan before and after, so I could show the change instead of describing it. Then I wrote a test that failed if the page made more than five queries, so nobody could bring the problem back by accident.

**Result:** The page went from eight seconds to three hundred milliseconds, and the complaints stopped. The query test caught the same mistake in a teammate's change two months later.

**Learned:** Measure first. My first guess was the images, and I would have spent a day on the wrong thing.

## 1. The sandbox

**Situation:**

**Task:**

**Action:**

**Result:**

**Learned:**

## 2. The faster query

**Situation:**

**Task:**

**Action:**

**Result:**

**Learned:**

## 3. The idempotent queue

**Situation:**

**Task:**

**Action:**

**Result:**

**Learned:**

## 4. A production bug

**Situation:**

**Task:**

**Action:**

**Result:**

**Learned:**

## 5. A disagreement

**Situation:**

**Task:**

**Action:**

**Result:**

**Learned:**

## 6. A failure

**Situation:**

**Task:**

**Action:**

**Result:**

**Learned:**
