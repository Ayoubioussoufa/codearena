/**
 * Tailwind — write-the-classes exercises. Graded as a class LIST: required
 * utilities must appear, forbidden ones must not; order and extras are
 * ignored. Imported by tailwind.ts.
 */
import { codeTask } from "../helpers";
import type { Generator } from "../types";

const DOC = { slug: "tailwind-responsive-design", label: "Dojo guide — Tailwind responsive design" };

const cardGrid: Generator = {
  id: "tw-code-cardgrid",
  title: "✍️ Responsive card grid classes",
  generate: (rng) => {
    const cols = rng.pick([3, 4] as const);
    const gap = rng.pick([4, 6, 8] as const);
    const required = ["grid", "grid-cols-1", "sm:grid-cols-2", `lg:grid-cols-${cols}`, `gap-${gap}`];
    return codeTask({
      genId: "tw-code-cardgrid",
      prompt: `Write the className for a card container: 1 column on phones, 2 from \`sm\`, ${cols} from \`lg\`, with a gap of ${gap * 4}px in both directions. (Space-separated classes — order doesn't matter.)`,
      language: "text",
      starter: "",
      solution: required.join(" "),
      classTask: { required, forbidden: ["flex"] },
      explanation: `Read it mobile-first: the plain \`grid-cols-1\` is the phone (one card per row), then each prefix overrides *when* the screen gets wider — \`sm:grid-cols-2 lg:grid-cols-${cols}\`. \`gap-${gap}\` is ${gap} × 4 = ${gap * 4}px between cards on both axes ("times four"). Use grid, not flex, because you can name the column count — and grid rows stretch cells to equal height for free, which is what makes a card gallery look tidy.`,
      docRef: DOC,
    });
  },
};

const overlay: Generator = {
  id: "tw-code-overlay",
  title: "✍️ Full-screen centering overlay",
  generate: () =>
    codeTask({
      genId: "tw-code-overlay",
      prompt:
        "Write the className for a modal BACKDROP: it must cover the entire viewport (stay put while the page scrolls) and center its dialog child both horizontally and vertically.",
      language: "text",
      starter: "",
      solution: "fixed inset-0 flex items-center justify-center",
      classTask: {
        required: ["fixed", "inset-0", "flex", "items-center", "justify-center"],
      },
      explanation:
        "`fixed` pins the element to the viewport (the visible window), and `inset-0` sets all four sides — top/right/bottom/left — to 0, so it covers the whole screen and stays put while the page scrolls (`absolute` would scroll away with the page). Then the perfect-centering trio: `flex` turns on flexbox, `justify-center` centres along the main axis (horizontal here), `items-center` along the cross axis (vertical) — dead-centre both ways. This exact stack is in your DeleteAccount dialog's DangerDialog.",
      docRef: DOC,
    }),
};

const navbar: Generator = {
  id: "tw-code-navbar",
  title: "✍️ Sticky translucent navbar classes",
  generate: () =>
    codeTask({
      genId: "tw-code-navbar",
      prompt:
        "Write the className for a navbar that sticks to the top while scrolling, blurs the content behind it, has a bottom border, and a translucent background in BOTH themes — about 80% opacity white in light mode, and dark slate (slate-950) at the same opacity in dark mode.",
      language: "text",
      starter: "",
      solution: "sticky top-0 border-b backdrop-blur bg-white/80 dark:bg-slate-950/80",
      classTask: {
        required: ["sticky", "top-0", "border-b", "backdrop-blur", "bg-white/80", "dark:bg-slate-950/80"],
        forbidden: ["fixed"],
      },
      explanation:
        "`sticky top-0` lets the navbar sit in the normal page layout (so content below isn't hidden under it), then \"sticks\" it to the top edge once you scroll that far — `fixed` would yank it out of the layout and you'd have to manually pad the page so nothing hid behind it. The `/80` on a colour means 80% opacity (slightly see-through), and `backdrop-blur` blurs whatever scrolls behind it, together giving the frosted-glass look. The `dark:` twin (`dark:bg-slate-950/80`) handles dark mode with zero JavaScript. It's the exact recipe in both apps' navbars.",
      docRef: DOC,
    }),
};

const scrollWrap: Generator = {
  id: "tw-code-scrollwrap",
  title: "✍️ Phone-safe wide-table wrapper",
  generate: () =>
    codeTask({
      genId: "tw-code-scrollwrap",
      prompt:
        "A data table is wider than a phone screen. Write the className for its WRAPPER so the table pans inside its own rounded, bordered card — and the page body never scrolls sideways.",
      language: "text",
      starter: "",
      solution: "overflow-x-auto rounded-xl border",
      classTask: {
        required: ["overflow-x-auto", "rounded-xl", "border"],
        forbidden: ["overflow-hidden", "w-screen"],
      },
      explanation:
        "`overflow-x-auto` gives this wrapper its own horizontal scrollbar, so the wide table pans *inside the card* while the page body stays still — the golden rule: **scroll the box, never the page.** `overflow-hidden` would silently clip the extra columns off the edge (lost data), and `w-screen` forces the element to full window width regardless of its parent, making things worse. Pair this wrapper with a `min-w-[…]` on the table itself so the columns stay readable while the box scrolls.",
      docRef: DOC,
    }),
};

const themedCard: Generator = {
  id: "tw-code-darkcard",
  title: "✍️ Dual-theme card classes",
  generate: () =>
    codeTask({
      genId: "tw-code-darkcard",
      prompt:
        "Write the className for a standard dojo card: extra-large rounded corners, 24px padding, a visible border, a white surface with a slate-200 border in light mode, and a slate-900 surface with a slate-800 border in dark mode.",
      language: "text",
      starter: "",
      solution: "rounded-xl p-6 border bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800",
      classTask: {
        required: ["rounded-xl", "p-6", "border", "bg-white", "border-slate-200", "dark:bg-slate-900", "dark:border-slate-800"],
      },
      explanation:
        "Pair every surface colour with its dark twin the moment you write it — `bg-white dark:bg-slate-900`, `border-slate-200 dark:border-slate-800` — otherwise you'll reopen hundreds of class strings later to retrofit dark mode. `p-6` is 24px (6 × 4, \"times four\"). And note `border` (which sets the border *width*) is a separate class from `border-slate-200` (its *colour*): forget the plain `border` and your coloured border is 0px wide and invisible — an extremely common head-scratcher.",
      docRef: DOC,
    }),
};

export const tailwindCodeGens: Generator[] = [cardGrid, overlay, navbar, scrollWrap, themedCard];
