/**
 * Checks for content/supplements/interview-playbook.md.
 * Checked 3 Nov 2026: Amazon's 16 Leadership Principles (amazon.jobs); formula sheet re-derived.
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const interviewPlaybookChecks: GuideCheckSet = {
  name: "Interview Playbook",
  source: {
    label: "Amazon: Leadership Principles",
    href: "https://www.amazon.jobs/content/en/our-workplace/leadership-principles",
    note: "The 16 principles behind half of every Amazon loop, in Amazon's own words; most big-tech behavioural rounds probe the same traits. Pair it with lesson 26 (STAR stories).",
  },
  terms: [
    "Bar Raiser",
    "Leadership Principles",
    "STAR",
    "Story bank",
    "Case interview",
    "Market sizing",
    "Harmonic mean",
    "Project deep-dive",
  ],
  checks: [
    {
      id: "archetypes",
      section: "The three archetypes",
      questions: [
        {
          prompt: "Which archetype usually filters candidates first with a timed aptitude test?",
          options: [
            "Product tech companies, like Amazon or Google",
            "IT services firms, like Capgemini or Deloitte",
            "Strategy consultancies, such as BCG or McKinsey",
            "Early startups, hiring with a take-home task",
          ],
          correct: 1,
          why: "Services firms open with an online aptitude and technical MCQ test (the real filter), then fundamentals plus your project, then HR. Product tech leads with DSA coding; strategy consulting with case interviews.",
        },
        {
          prompt: "What does BCG X's tech track add on top of a light case?",
          options: [
            "A week-long paid trial on client projects",
            "A group exercise judged on presentation only",
            "An English exam and a personality survey",
            "Coding, an architecture talk, and product sense",
          ],
          correct: 3,
          why: "The tech arms (BCG X, McKinsey Digital) mix case-lite with a coding exercise, an architecture discussion and product sense (\"How would you build a rating system?\"), where your CodeArena story is the answer.",
        },
      ],
      explain: "For your own BCG X application, list the stages you expect and which dojo tool drills each one.",
    },
    {
      id: "star",
      section: "Amazon and STAR",
      questions: [
        {
          prompt: "In the Action part of a STAR story, what does the interviewer listen for?",
          options: [
            "What you personally did, said with \"I\"",
            "What the team did, said with \"we\"",
            "Which tools the project used, in order",
            "How long each task took, in hours",
          ],
          correct: 0,
          why: "Action is \"what did you specifically do\". \"We\" hides your contribution; specifics and \"I\" show it. Then the Result, quantified: numbers, time saved, bugs prevented.",
        },
        {
          prompt: "How should you prepare behavioural answers?",
          options: [
            "A memorised script for each of the questions",
            "One great story, reused for each new question",
            "A bank of 8–10 real stories, each tagged",
            "Notes that you read aloud during the interview",
          ],
          correct: 2,
          why: "Scripts break on the first follow-up. A bank of real situations, each tagged with the two or three principles it can serve, lets you answer anything; rehearse each until three follow-up probes stop surprising you.",
        },
      ],
      explain: "Tell one CodeArena story in STAR form in under two minutes: two sentences of situation, your task, what you did with \"I\", and a number for the result.",
    },
    {
      id: "aptitude",
      section: "The aptitude formula sheet",
      questions: [
        {
          prompt: "A price rises 20%, then falls 20%. What's the net change?",
          options: [
            "No change at all",
            "A 4% rise overall",
            "A 4% fall overall",
            "A 2% fall overall",
          ],
          correct: 2,
          why: "Net = a + b + ab/100 = 20 − 20 + (20 × −20)/100 = −4. The fall is taken on the bigger, already-raised price, so you end below where you started.",
        },
        {
          prompt: "You drive equal distances at 60 km/h and 40 km/h. What's the average speed?",
          options: [
            "48 km/h, the harmonic mean",
            "50 km/h, the arithmetic mean",
            "45 km/h, the geometric mean",
            "52 km/h, the weighted mean",
          ],
          correct: 0,
          why: "Over equal distances you spend longer at the slow speed, so average speed is 2ab/(a + b) = 2 × 60 × 40 / 100 = 48, not (a + b)/2.",
        },
        {
          prompt: "A finishes a job in 6 days, B in 3. Working together, how long?",
          options: [
            "4.5 days, the average of both",
            "9 days, the two times added",
            "3 days, the faster worker's time",
            "2 days, because their rates add",
          ],
          correct: 3,
          why: "Think in work per day: A does 1/6, B does 1/3, together 1/2 a job per day, so 2 days. The shortcut is xy/(x + y) = 18/9 = 2.",
        },
      ],
      explain: "Derive CI − SI over two years, P(r/100)², from the two formulas, out loud.",
    },
    {
      id: "project",
      section: "Presenting CodeArena",
      questions: [
        {
          prompt: "Which sentence separates builders from tutorial-followers in a project deep-dive?",
          options: [
            "\"I used the most popular stack for every layer\"",
            "\"I considered X and Y, chose Y because Z\"",
            "\"I followed the guide's steps one at a time\"",
            "\"I built every feature that the brief had listed\"",
          ],
          correct: 1,
          why: "Naming the options you weighed, the one you picked and why, plus a number (latency, throughput, test count), proves the decision was yours. Listing technologies proves only that you installed them.",
        },
        {
          prompt: "What are the three altitudes to prepare for presenting CodeArena?",
          options: [
            "Pitch, architecture story, and three deep dives",
            "Demo video, slide deck, and repository link",
            "Tech stack, folder layout, and test count",
            "Business plan, product roadmap, and feature list",
          ],
          correct: 0,
          why: "The pitch says what it is and why; the 2–3 minute architecture story is whiteboardable; the deep-dives (security, math, scale) are where you prove depth with options, choices and numbers.",
        },
      ],
      explain: "Give your 30-second CodeArena pitch, then draw the architecture in words in under a minute.",
    },
  ],
};
