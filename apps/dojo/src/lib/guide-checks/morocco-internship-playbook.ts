/**
 * Checks for content/supplements/morocco-internship-playbook.md.
 * The checks quiz strategy, not market figures (a July 2026 snapshot). Amazon OA structure confirmed on amazon.jobs, 3 Nov 2026.
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const moroccoChecks: GuideCheckSet = {
  name: "Morocco internship playbook",
  source: {
    label: "Amazon: online assessment prep for SDE roles",
    href: "https://www.amazon.jobs/content/en/how-we-hire/university/sde-oa",
    note: "The one first-party description of a Game 1 screen: for internships, about 90 minutes (a 70-minute coding assessment, a 15-minute work-style one, a short survey), with a practice test. For ESN campaigns, the company's own careers page is always the source of truth.",
  },
  terms: [
    "ESN",
    "PFE",
    "Pré-embauche",
    "CDI",
    "Bac+5 filter",
    "Online assessment",
    "Referral",
    "Application funnel",
  ],
  checks: [
    {
      id: "games",
      section: "The verdict and the two games",
      questions: [
        {
          prompt: "Which preparation choice does the playbook recommend for a 3–4 month window?",
          options: [
            "Switch fully to Java, and drop TypeScript",
            "Keep NestJS, and add credible Spring Boot",
            "Add .NET too, to cover Microsoft ESNs",
            "Stay with NestJS alone, and skip Java",
          ],
          correct: 1,
          why: "Don't restart from zero: TypeScript/NestJS stays the production stack, focused Java/Spring passes the enterprise filters, and one deployed, tested CodeArena proves both.",
        },
        {
          prompt: "How do Game 1 (Amazon, Oracle, BCG X) interviews differ from Game 2 (ESN) ones?",
          options: [
            "Take-home projects, versus a timed online DSA test",
            "System design, versus a set of front-end exercises",
            "Group exercises, versus a set of HR interviews",
            "Live English DSA, versus CV probing in French",
          ],
          correct: 3,
          why: "Game 1 screens with a timed online assessment, then live DSA and heavy behavioral rounds in English. Game 2 screens the CV and an MCQ/coding test, then probes every CV line, mostly in French. The two overlap about 60%.",
        },
      ],
      explain: "Explain the Bac+5 constraint, how the playbook's strategy works around it, and the one line you must never cross.",
    },
    {
      id: "market",
      section: "The market and the calendar",
      questions: [
        {
          prompt: "Why does the playbook call the PFE \"the one that converts\"?",
          options: [
            "Many PFE interns get a pre-hire CDI offer",
            "It's the only internship that's paid in Morocco",
            "Its subjects are chosen by the student alone",
            "It's the one kind of internship ESNs offer",
          ],
          correct: 0,
          why: "The Projet de Fin d'Études (4–6 months, usually February–July) is Morocco's main junior-hiring funnel: ESNs open hundreds of subjects a season, and a large share end in a pré-embauche offer of a permanent contract.",
        },
        {
          prompt: "When do ESN PFE campaigns and the big school forums happen?",
          options: [
            "February to March, just as the internships start",
            "May to June, just after the end-of-year exams",
            "October to November, and interviews up to January",
            "All through the year, with no particular season",
          ],
          correct: 2,
          why: "Forums (Forum GENI, Forum EMI-Entreprises) and campaigns open in October–November; December–January is peak interviewing. Game 1 portals open earlier, in July–September, so apply the day postings appear.",
        },
      ],
      explain: "Walk through the annual calendar and what you do in each period, starting from July.",
    },
    {
      id: "applying",
      section: "The employers, applying and prep",
      questions: [
        {
          prompt: "Which channel does the playbook rate as worth about ten cold applications?",
          options: [
            "A posting found on a Moroccan job board online",
            "A spontaneous email to the company's HR team inbox",
            "A referral from an alumnus who forwards your CV",
            "A LinkedIn post that announces you're open to work",
          ],
          correct: 2,
          why: "One alumnus forwarding your CV is worth roughly ten cold applications, which is why 10 thoughtful networking messages a week sit in the cadence alongside the applications.",
        },
        {
          prompt: "An ESN hasn't answered 10 days after your one polite follow-up. What does the playbook say?",
          options: [
            "Move on: ESNs ghost heavily, and it's not personal",
            "Send a follow-up every three days until they reply",
            "Call the recruiter directly, on their own personal mobile",
            "Withdraw every other application you sent to that company",
          ],
          correct: 0,
          why: "One follow-up after 7–10 days, then silence means move on. Track everything in a sheet (company, role, date, channel, contact, status, next follow-up) so nothing is chased twice.",
        },
      ],
      explain: "Name three red flags that get a candidate filtered out, and say how you'd avoid each one.",
    },
  ],
};
