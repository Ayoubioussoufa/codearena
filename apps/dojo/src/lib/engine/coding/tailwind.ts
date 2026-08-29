/**
 * Coding track: Tailwind — flexbox and grid drilled from a first centered row
 * up to a responsive 12-column dashboard. Graded as a CLASS LIST: the required
 * utilities must all appear, forbidden ones must not; order and extra classes
 * are ignored.
 */
import { codeTask, multiFileTask } from "../helpers";
import type { Generator } from "../types";
import type { CodingTrack } from "../coding";
import { tailwindCodeGens } from "../topics/tailwind-code";

const DOC = { slug: "tailwind-responsive-design", label: "Dojo guide — Tailwind responsive design" };

/* ── Level 1 — flex basics ── */

const flexCenterRow: Generator = {
  id: "tw-flex-center-row",
  title: "Center a row with flex",
  generate: () =>
    codeTask({
      genId: "tw-flex-center-row",
      prompt:
        "Write the className for a container that lays its children in a ROW, vertically centers them, and puts a 12px gap between them. (Space-separated classes — order doesn't matter.)",
      language: "text",
      starter: "",
      solution: "flex items-center gap-3",
      classTask: { required: ["flex", "items-center", "gap-3"], forbidden: ["grid", "flex-col"] },
      explanation:
        "`flex` turns on flexbox with a horizontal main axis (a row) by default. On a row, the CROSS axis is vertical, so `items-center` centers children top-to-bottom. `gap-3` is 3 × 4 = 12px of space between items — cleaner than margins because it never adds space on the outer edges. This three-class combo is the single most common layout you'll write.",
      docRef: DOC,
    }),
};

const stackColumn: Generator = {
  id: "tw-stack-column",
  title: "Stack items in a column",
  generate: () =>
    codeTask({
      genId: "tw-stack-column",
      prompt:
        "Write the className for a vertical STACK: children flow top-to-bottom, stretched to full width, with a 16px gap between them.",
      language: "text",
      starter: "",
      solution: "flex flex-col gap-4",
      classTask: { required: ["flex", "flex-col", "gap-4"], forbidden: ["grid", "items-center"] },
      explanation:
        "`flex flex-col` flips the main axis to vertical, so children stack. With a column, the cross axis is horizontal and the default `items-stretch` makes each child fill the width — exactly what you want for stacked cards or form rows. `gap-4` (16px) spaces them evenly. Reach for this instead of margin-bottom on each child: the gap can't leak an extra margin after the last item.",
      docRef: DOC,
    }),
};

/* ── Level 2 — distribution & simple grid ── */

const spaceBetween: Generator = {
  id: "tw-space-between",
  title: "Push items to the edges",
  generate: () =>
    codeTask({
      genId: "tw-space-between",
      prompt:
        "Write the className for a navbar bar: a row that pushes the logo to the far left and the menu to the far right, with everything vertically centered. Add horizontal padding of 24px.",
      language: "text",
      starter: "",
      solution: "flex items-center justify-between px-6",
      classTask: { required: ["flex", "items-center", "justify-between", "px-6"], forbidden: ["grid"] },
      explanation:
        "`justify-between` distributes free space *between* items along the main axis — first item hugs the start, last hugs the end, gaps split evenly. It's the one-class answer to 'logo left, actions right'. `items-center` handles the vertical alignment, and `px-6` (24px) keeps the content off the window edges. No floats, no `margin-left: auto` gymnastics.",
      docRef: DOC,
    }),
};

const gridTwoCol: Generator = {
  id: "tw-grid-two-col",
  title: "A basic two-column grid",
  generate: () =>
    codeTask({
      genId: "tw-grid-two-col",
      prompt:
        "Write the className for a two-column grid with equal columns and a 16px gap in both directions.",
      language: "text",
      starter: "",
      solution: "grid grid-cols-2 gap-4",
      classTask: { required: ["grid", "grid-cols-2", "gap-4"], forbidden: ["flex"] },
      explanation:
        "`grid grid-cols-2` creates two equal `1fr` columns — children flow into them automatically, no per-child widths. `gap-4` spaces rows AND columns at once. Choose grid over flex the moment you can name the number of columns: grid also makes every cell in a row the same height for free, which is what keeps a card layout tidy.",
      docRef: DOC,
    }),
};

/* ── Level 4 — spanning & explicit tracks ── */

const gridSpan: Generator = {
  id: "tw-grid-span",
  title: "Span a cell across columns",
  generate: () =>
    codeTask({
      genId: "tw-grid-span",
      prompt:
        "You have a 3-column grid. Write the className for the FEATURED item that should take up two of those three columns (and stay one row tall).",
      language: "text",
      starter: "",
      solution: "col-span-2",
      classTask: { required: ["col-span-2"], forbidden: ["row-span-2", "w-2/3"] },
      explanation:
        "Inside a grid, a child controls how many tracks it occupies with `col-span-N` — `col-span-2` makes the featured cell straddle two columns while its siblings take one each. Note this is a class on the CHILD, not the grid container. Don't fake it with `w-2/3`: that sets a width but doesn't reserve grid tracks, so the other cells won't reflow around it correctly.",
      docRef: DOC,
    }),
};

const responsiveSidebar: Generator = {
  id: "tw-responsive-sidebar",
  title: "Responsive sidebar layout",
  generate: () =>
    codeTask({
      genId: "tw-responsive-sidebar",
      prompt:
        "Write the className for an app shell container: a single stacked column on phones, but from the `md` breakpoint a two-track grid with a fixed 240px sidebar and a flexible content area that fills the rest. Use a 24px gap.",
      language: "text",
      starter: "",
      solution: "grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6",
      classTask: {
        required: ["grid", "grid-cols-1", "md:grid-cols-[240px_1fr]", "gap-6"],
        forbidden: ["flex"],
      },
      explanation:
        "Mobile-first: `grid-cols-1` is the phone default (everything stacked), then `md:grid-cols-[240px_1fr]` overrides it on wider screens. The arbitrary-value track list `[240px_1fr]` gives a rigid 240px sidebar and a `1fr` content column that soaks up all remaining space — the underscore is Tailwind's stand-in for the space inside `grid-template-columns`. One class expresses a layout that used to need a media query and two rules.",
      docRef: DOC,
    }),
};

/* ── Level 5 — a real dashboard grid ── */

const dashboardGrid: Generator = {
  id: "tw-dashboard-grid",
  title: "A 12-column dashboard grid",
  generate: () =>
    codeTask({
      genId: "tw-dashboard-grid",
      prompt:
        "Write the className for a dashboard container: a 12-column grid with a 24px gap, kept from stretching too wide by a max-width cap and centered with automatic horizontal margins, plus 16px of horizontal padding. (Children will place themselves with col-span-* utilities.)",
      language: "text",
      starter: "",
      solution: "grid grid-cols-12 gap-6 max-w-7xl mx-auto px-4",
      classTask: {
        required: ["grid", "grid-cols-12", "gap-6", "max-w-7xl", "mx-auto", "px-4"],
        forbidden: ["flex"],
      },
      explanation:
        "The 12-column grid is the workhorse of dashboards: 12 divides cleanly into halves, thirds, quarters and sixths, so any panel width is a `col-span-*` away (`col-span-6` = half, `col-span-4` = a third). `max-w-7xl mx-auto` caps the line length and centers the whole board on large monitors; `px-4` keeps it off the edges on small ones. The container defines the tracks; each panel just declares how many columns it wants.",
      docRef: DOC,
    }),
};

const badgePill: Generator = {
  id: "tw-badge-pill",
  title: "A pill badge",
  generate: () =>
    codeTask({
      genId: "tw-badge-pill",
      prompt:
        "Write the className for a status badge: an inline element that sits inline with text, centers its content, is fully rounded (pill shape), with 12px horizontal and 4px vertical padding and small text.",
      language: "text",
      starter: "",
      solution: "inline-flex items-center rounded-full px-3 py-1 text-xs",
      classTask: {
        required: ["inline-flex", "items-center", "rounded-full", "px-3", "py-1", "text-xs"],
        forbidden: ["block", "flex"],
      },
      explanation:
        "`inline-flex` (not `flex`) keeps the badge inline with surrounding text while still giving you flex alignment for an icon + label. `rounded-full` makes the pill — with equal `py`, the border-radius exceeds half the height so both ends are semicircles. `px-3 py-1` (12px / 4px) is the compact padding that reads as a tag rather than a button. Asymmetric `px` > `py` is what makes pills look right.",
      docRef: DOC,
    }),
};

const responsiveHide: Generator = {
  id: "tw-responsive-hide",
  title: "Show/hide by breakpoint",
  generate: () =>
    codeTask({
      genId: "tw-responsive-hide",
      prompt:
        "Write the className for a desktop-only nav: HIDDEN on phones, then displayed as a block from the `md` breakpoint up.",
      language: "text",
      starter: "",
      solution: "hidden md:block",
      classTask: { required: ["hidden", "md:block"], forbidden: ["block"] },
      explanation:
        "Mobile-first again: the unprefixed `hidden` is the phone default (`display: none`), and `md:block` OVERRIDES it from 768px up. This two-class pattern is how you swap a hamburger menu (`md:hidden`) for a full nav (`hidden md:flex`) — render both, let the breakpoints decide which is visible. Never start with `block` here; the base utility must be the small-screen state.",
      docRef: DOC,
    }),
};

const hoverFocusButton: Generator = {
  id: "tw-hover-focus",
  title: "Interactive states",
  generate: () =>
    codeTask({
      genId: "tw-hover-focus",
      prompt:
        "Write the className for a primary button with STATE variants: a cyan-600 background, large-rounded corners, and 16px/8px padding; darkening to cyan-500 on hover; and on keyboard focus, dropping the browser's default outline and replacing it with a 2px focus ring in cyan-500 (so focus stays visible).",
      language: "text",
      starter: "",
      solution:
        "rounded-lg bg-cyan-600 px-4 py-2 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500",
      classTask: {
        required: ["bg-cyan-600", "hover:bg-cyan-500", "focus:outline-none", "focus:ring-2", "focus:ring-cyan-500"],
        forbidden: [],
      },
      explanation:
        "State variants prefix a utility with the condition: `hover:` applies on mouseover, `focus:` on keyboard/click focus. Accessibility matters here — if you kill the browser outline with `focus:outline-none`, you MUST replace it with a visible `focus:ring-2` so keyboard users can see where they are. Other variants stack the same way: `active:`, `disabled:`, `dark:`, `group-hover:`.",
      docRef: DOC,
    }),
};

const autoFitGrid: Generator = {
  id: "tw-autofit-grid",
  title: "Auto-fitting grid",
  generate: () =>
    codeTask({
      genId: "tw-autofit-grid",
      prompt:
        "Write the className for a gallery that fits as many columns as possible with NO media queries: each column at least 200px wide, then growing to share the leftover space, with a 16px gap. A fixed `grid-cols-N` can't do this — you'll need an arbitrary-value grid track built from a CSS `repeat(...)` expression.",
      language: "text",
      starter: "",
      solution: "grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4",
      classTask: {
        required: ["grid", "grid-cols-[repeat(auto-fill,minmax(200px,1fr))]", "gap-4"],
        forbidden: ["flex"],
      },
      explanation:
        "`repeat(auto-fill, minmax(200px, 1fr))` is intrinsically responsive: the browser packs as many 200px-minimum columns as fit, then stretches them to `1fr` each to share the leftover space — so the layout reflows on ANY container width with zero breakpoints. `auto-fill` leaves empty tracks when items run out; `auto-fit` collapses them so existing items stretch wider. This one line replaces a stack of `sm:/md:/lg:grid-cols-*` overrides.",
      docRef: DOC,
    }),
};

const stickyHeader: Generator = {
  id: "tw-sticky-header",
  title: "A sticky translucent header",
  generate: () =>
    codeTask({
      genId: "tw-sticky-header",
      prompt:
        "Write the className for a page header that STICKS to the top as you scroll (holding its place in the layout flow, not overlapping content the way fixed would), stays layered above the scrolling body, and is translucent white at about 80% opacity with a frosted blur behind it.",
      language: "text",
      starter: "",
      solution: "sticky top-0 z-10 bg-white/80 backdrop-blur",
      classTask: {
        required: ["sticky", "top-0", "z-10", "bg-white/80", "backdrop-blur"],
        forbidden: ["fixed", "absolute"],
      },
      explanation:
        "`sticky` + `top-0` means 'scroll normally until you hit the top, then stay pinned' — unlike `fixed`, it holds its place in the layout flow, so it doesn't overlap content or need a spacer. `z-10` keeps it above the scrolling body. `bg-white/80` is white at 80% opacity (the `/80` is the alpha), and `backdrop-blur` frosts whatever scrolls underneath — the modern translucent navbar look.",
      docRef: DOC,
    }),
};

/* ── Multi-file capstone — compose a component from styled pieces ── */

const statCard: Generator = {
  id: "tw-stat-card",
  title: "Compose a stat card",
  generate: () =>
    multiFileTask({
      genId: "tw-stat-card",
      prompt:
        "Build a dashboard STAT CARD by styling each piece on its own tab, then composing them. You're styling: the card shell, the muted label, the big number, and a green ▲ trend pill. Write the class list for each element, **Debug this file** to check it, then **submit all** when the whole card is styled. (Space-separated classes — order and extra utilities don't matter.) Open a piece's hints if you're unsure which utilities to reach for.",
      files: [
        {
          name: "card (container)",
          language: "text",
          role: "the card shell",
          hint: "Reach for the box utilities: a rounded corner (`rounded-xl`), a `border`, a white background, inner padding, and a soft `shadow-sm` — together they read as a card rather than a bare div. Spacing is on a 4px scale, so `p-6` is 24px of padding.",
          starter: "",
          solution: "rounded-xl border bg-white p-6 shadow-sm",
          classTask: {
            required: ["rounded-xl", "border", "bg-white", "p-6", "shadow-sm"],
            forbidden: [],
          },
        },
        {
          name: "label",
          language: "text",
          role: "the muted caption above the number",
          hint: "A caption wants small, medium-weight, muted text: a `text-` size on the small end, a `font-` weight, and a low-contrast slate `text-` colour. It should read as secondary to the number, so keep it small.",
          starter: "",
          solution: "text-sm font-medium text-slate-500",
          classTask: {
            required: ["text-sm", "font-medium", "text-slate-500"],
            forbidden: ["text-3xl"],
          },
        },
        {
          name: "value (the number)",
          language: "text",
          role: "the headline figure",
          hint: "The figure is the headline: a large `text-` size, a bold `font-` weight, and a small top margin (`mt-`) to separate it from the label. Add `tabular-nums` so the digits are equal-width and don't jitter as the value changes.",
          starter: "",
          solution: "mt-1 text-3xl font-bold tabular-nums",
          classTask: {
            required: ["mt-1", "text-3xl", "font-bold", "tabular-nums"],
            forbidden: ["text-sm"],
          },
        },
        {
          name: "trend (pill badge)",
          language: "text",
          role: "the inline change pill",
          hint: "A pill is a small inline element: `inline-flex` (NOT `flex`, so it sits inline with the value) plus `items-center`, a fully-round `rounded-full`, tight asymmetric padding (`px-` a little more than `py-`), small `text-`, and a green tint — a light `bg-emerald-*` behind a darker `text-emerald-*`.",
          starter: "",
          solution:
            "inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700",
          classTask: {
            required: [
              "inline-flex",
              "items-center",
              "rounded-full",
              "bg-emerald-100",
              "px-2",
              "py-0.5",
              "text-xs",
              "text-emerald-700",
            ],
            forbidden: ["block", "flex"],
          },
        },
      ],
      explanation:
        "A component is composed from independently styled pieces, and Tailwind keeps each piece's styling right on its own element. The card shell owns the box (`rounded-xl border shadow-sm p-6`); the label and value form a type SCALE — a muted `text-sm text-slate-500` caption over a `text-3xl font-bold` figure, with `tabular-nums` so the digits don't jitter as the number changes; and the trend uses `inline-flex` (not `flex`) so the pill sits inline with the value while still centering its icon and text. Style each part in isolation, and the whole card reads as one system.",
      docRef: DOC,
    }),
};

const levelFor: Record<string, 2 | 3 | 4> = {
  "tw-code-scrollwrap": 2,
  "tw-code-cardgrid": 3,
  "tw-code-overlay": 3,
  "tw-code-navbar": 3,
  "tw-code-darkcard": 4,
};

export const tailwindTrack: CodingTrack = {
  id: "coding-tailwind",
  title: "Tailwind CSS",
  icon: "🎨",
  stack: "Tailwind",
  blurb:
    "Flexbox and grid, drilled by writing the class list — from centering a row to a responsive 12-column dashboard. Every important layout primitive, many times over.",
  exercises: [
    { level: 1, gen: flexCenterRow },
    { level: 1, gen: stackColumn },
    { level: 1, gen: badgePill },
    { level: 2, gen: spaceBetween },
    { level: 2, gen: gridTwoCol },
    { level: 2, gen: responsiveHide },
    ...tailwindCodeGens.map((gen) => ({ level: levelFor[gen.id] ?? 3, gen })),
    { level: 3, gen: hoverFocusButton },
    { level: 3, gen: statCard },
    { level: 4, gen: gridSpan },
    { level: 4, gen: responsiveSidebar },
    { level: 4, gen: autoFitGrid },
    { level: 4, gen: stickyHeader },
    { level: 5, gen: dashboardGrid },
  ],
};
