/**
 * Checks for content/supplements/tailwind-responsive-design.md.
 * Checked 3 Nov 2026 against tailwindcss.com (v4 dark mode, breakpoints) and CodeArena's globals.css.
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const tailwindChecks: GuideCheckSet = {
  name: "Tailwind guide",
  source: {
    label: "Tailwind CSS docs: Responsive design",
    href: "https://tailwindcss.com/docs/responsive-design",
    note: "The official page on breakpoints and mobile-first, for Tailwind v4 (the version CodeArena runs). Then read [Dark mode](https://tailwindcss.com/docs/dark-mode).",
  },
  terms: [
    "Utility class",
    "Variant",
    "Breakpoint",
    "Mobile-first",
    "Flexbox",
    "Grid",
    "Spacing scale",
    "Overflow container",
  ],
  checks: [
    {
      id: "basics",
      section: "§0–3 · Utilities, variants, mobile-first",
      questions: [
        {
          prompt: "On a 375px phone, what does `flex-col lg:flex-row` do?",
          options: [
            "Puts the children side by side, laptop style",
            "Stacks the children, since lg starts at 1024px",
            "Hides the children until the screen gets wider",
            "Uses flex-row, since lg is the later class",
          ],
          correct: 1,
          why: "Unprefixed classes apply at every width; `lg:` adds its rule only from 1024px up. So phones get the plain `flex-col`. Mobile-first: describe the phone with plain classes, then layer bigger-screen overrides on top.",
        },
        {
          prompt: "You keep adding `max-md:` classes to undo a layout on phones. What does that suggest?",
          options: [
            "The project needs more breakpoints configured in it",
            "The Tailwind breakpoints have been set up wrong",
            "The page should use a separate mobile bundle",
            "The base layout was written for desktop first",
          ],
          correct: 3,
          why: "If you're subtracting instead of adding, the plain classes describe the desktop. Flip it: phone layout unprefixed, then `md:`/`lg:` overrides. `max-md:` exists for rare exceptions, not as a habit.",
        },
      ],
      explain: "Explain mobile-first to a teammate in three sentences, using `flex flex-col gap-4 lg:flex-row lg:gap-8` as the example.",
    },
    {
      id: "layout",
      section: "§4–6 · Flexbox, grid, spacing",
      questions: [
        {
          prompt: "How many pixels is `gap-6`?",
          options: [
            "24px, since each step is 4px",
            "6px, since the number is pixels",
            "12px, since each step is 2px",
            "36px, since the scale is squared",
          ],
          correct: 0,
          why: "One scale drives padding, margin, gap and width: multiply the number by 4. `p-5` is 20px, `w-64` is 256px. Sticking to even steps gives a rhythm that reads as designed.",
        },
        {
          prompt: "Why space children with the parent's `gap` rather than a margin on each child?",
          options: [
            "Margins don't work inside flex or grid parents",
            "Gap renders faster because it skips the layout",
            "One place owns the spacing, no stray edges",
            "Margins are removed by the Tailwind reset styles",
          ],
          correct: 2,
          why: "`gap` puts the decision in the parent and never adds space before the first child or after the last; per-child margins scatter it and cause \"why is there extra space at the top\" bugs.",
        },
      ],
      explain: "Describe the container recipe `mx-auto max-w-6xl px-4 sm:px-6`, class by class, and what you'd see on a phone and on a big monitor.",
    },
    {
      id: "dark",
      section: "§7–8 · Dark mode and wide content",
      questions: [
        {
          prompt: "In Tailwind v4, what decides when `dark:` utilities apply, out of the box?",
          options: [
            "A dark class that Tailwind adds automatically",
            "The current time in the visitor's timezone",
            "The operating system's color scheme, via CSS",
            "A theme field in the tailwind.config.js file",
          ],
          correct: 2,
          why: "By default `dark:` uses the `prefers-color-scheme` media query. CodeArena switches to a class strategy with `@custom-variant dark (&:where(.dark, .dark *));`, so a `dark` class on `<html>` (set from the user's saved choice) decides.",
        },
        {
          prompt: "A wide table pushes the whole page sideways on a phone. What's the fix?",
          options: [
            "Wrap it in a box with overflow-x-auto",
            "Shrink the table's font until it fits",
            "Hide the table's extra columns below 640px",
            "Set the page body to overflow visible",
          ],
          correct: 0,
          why: "The page body must never scroll horizontally. A wrapper with `overflow-x-auto` gives the table its own scrollbar, and `min-w-[640px]` on the table keeps columns readable while the box pans.",
        },
      ],
      explain: "Explain why dark mode should be styled as you build each element, and the mistake people make with text colour.",
    },
  ],
};
