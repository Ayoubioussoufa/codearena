/**
 * Topic: Tailwind responsive design (drills the Dojo supplement guide).
 */
import { choice, numeric } from "../helpers";
import type { Generator, Topic } from "../types";
import { tailwindCodeGens } from "./tailwind-code";

const DOC = { slug: "tailwind-responsive-design", label: "Dojo guide — Tailwind responsive design" };

const breakpoints: Generator = {
  id: "tw-breakpoints",
  title: "Mobile-first breakpoints",
  generate: (rng) => {
    const cols = rng.int(2, 4);
    const bp = rng.pick(["sm", "md", "lg"] as const);
    return choice(rng, {
      genId: "tw-breakpoints",
      prompt: `You want 1 column on phones and ${cols} columns from the ${bp} breakpoint up. Which classes?`,
      correct: `grid grid-cols-1 ${bp}:grid-cols-${cols}`,
      wrong: [
        `grid grid-cols-${cols} ${bp}:grid-cols-1`,
        `grid ${bp}:grid-cols-1 grid-cols-${cols}`,
        `grid grid-cols-1 max-${bp}:grid-cols-${cols}`,
      ],
      explanation: `Read the colon as "when": \`${bp}:grid-cols-${cols}\` means "${cols} columns *when* the screen is ${bp}-sized or bigger". Tailwind is **mobile-first**, so the plain class with no prefix is your phone design (\`grid-cols-1\` = one column), and a prefix only *adds* its rule from that width **upward** — it never touches smaller screens. The reversed answers make the desktop the default and phones the exception (backwards), and \`max-${bp}:\` means "*below* that width", which flips the whole meaning. Class order never changes the result — only the prefix does.`,
      docRef: DOC,
    });
  },
};

const flexAxis: Generator = {
  id: "tw-flex-axis",
  title: "Flexbox axes: justify vs items",
  generate: (rng) => {
    const isRow = rng.chance(0.5);
    const goal = rng.pick(["center", "space out", "push to the end"] as const);
    const justify = goal === "center" ? "justify-center" : goal === "space out" ? "justify-between" : "justify-end";
    const axis = isRow ? "horizontally" : "vertically";
    return choice(rng, {
      genId: "tw-flex-axis",
      prompt: `In a \`flex ${isRow ? "flex-row" : "flex-col"}\` container, which class ${goal === "space out" ? "spaces the children out" : goal === "center" ? "centers the children" : "pushes the children to the end"} ${axis}?`,
      correct: justify,
      wrong: [
        goal === "center" ? "items-center" : goal === "space out" ? "items-stretch" : "items-end",
        goal === "center" ? "text-center" : "content-between",
        isRow ? "align-middle" : "self-center",
      ],
      explanation: `Two alignment tools, one per direction: **\`justify-*\` moves children along the main axis** (the way the line runs) and **\`items-*\` moves them along the cross axis** (across it). Here the container is \`flex-${isRow ? "row" : "col"}\`, so its main axis is ${axis} — exactly the direction you wanted — which is why \`justify-*\` is the tool. The trap: never memorise "justify = horizontal", because in a column the main axis is vertical and it would move things up/down instead. Chant "**justify = main, items = cross**". (\`text-center\` only aligns text; \`align-middle\`/\`self-center\` are unrelated tools.) This one pair is most of Tailwind layout fluency.`,
      docRef: DOC,
    });
  },
};

const spacingScale: Generator = {
  id: "tw-spacing",
  title: "The spacing scale",
  generate: (rng) => {
    const token = rng.pick([2, 3, 4, 6, 8, 10, 12] as const);
    const px = token * 4;
    const util = rng.pick(["p", "gap", "m", "px"] as const);
    return numeric({
      genId: "tw-spacing",
      prompt: `How many CSS pixels is \`${util}-${token}\` (default scale, 1rem = 16px)?`,
      answer: px,
      tolerance: 0,
      placeholder: "px",
      explanation: `The whole spacing scale has one rule: **each step is 4px** (that's 0.25rem, since 1rem = 16px). So \`${util}-${token}\` = ${token} × 4 = ${px}px (= ${token / 4}rem). Memory hook — "**times four**": see a spacing class, multiply the number by 4, and you've read it in pixels on sight. The same scale drives padding (\`p-\`), margin (\`m-\`), the gap between children (\`gap-\`) and width/height, which is what keeps a whole page's spacing on one tidy rhythm.`,
      docRef: DOC,
    });
  },
};

const darkVariant: Generator = {
  id: "tw-dark",
  title: "Dark mode variants",
  generate: (rng) => {
    const variant = rng.chance(0.5);
    return choice(rng, {
      genId: "tw-dark",
      prompt: variant
        ? "With class-strategy dark mode (like CodeArena), when does `dark:bg-slate-900` apply?"
        : "A card reads `bg-white dark:bg-slate-900`. What does the browser actually do?",
      correct: variant
        ? "When an ancestor (usually <html>) has the `dark` class — regardless of the OS setting"
        : "Both rules exist in CSS; the dark one wins only while the `.dark` class is present on an ancestor",
      wrong: variant
        ? [
            "Whenever the OS is in dark mode, automatically",
            "Only when JavaScript re-renders the component with a dark prop",
            "When the page URL contains ?theme=dark",
          ]
        : [
            "JavaScript swaps the class string between the two on toggle",
            "The dark rule replaces the light one at build time",
            "The browser picks one at random and caches it",
          ],
      explanation:
        "Dark mode here uses the **class strategy**: one `dark` class sits on the top-level `<html>` element, and every `dark:` utility switches on *when* that class is present. So toggling that single class flips the entire page at once — pure CSS, nothing in React re-renders, no per-component \"am I dark?\" logic. Ignoring the OS setting is deliberate: the visitor's own choice (saved in the browser's localStorage) beats the system default. And the theme script runs *before* the page paints, so the class is already there on the first frame — otherwise you'd see a light flash before it corrected.",
      docRef: DOC,
    });
  },
};

const gridSpan: Generator = {
  id: "tw-grid-span",
  title: "Grid columns & spans",
  generate: (rng) => {
    const cols = rng.pick([3, 4, 6] as const);
    const span = rng.int(2, cols - 1);
    const items = rng.int(cols + 2, cols * 2);
    const perRowAfterFirst = cols;
    const firstRowRemainder = cols - span;
    return numeric({
      genId: "tw-grid-span",
      prompt: `A \`grid grid-cols-${cols}\` container holds ${items} single-cell items, but the FIRST item has \`col-span-${span}\`. How many items fit on the first row (including the spanning one)?`,
      answer: 1 + firstRowRemainder,
      tolerance: 0,
      placeholder: "items on row 1",
      explanation: `Think of each row as a **budget of ${cols} track slots** (that's what \`grid-cols-${cols}\` gives you). The first item spends \`col-span-${span}\`, using ${span} slots, so only ${firstRowRemainder} remain — room for ${firstRowRemainder} more single-cell item(s). That's ${1 + firstRowRemainder} items on row one; every later full row fits ${perRowAfterFirst}. A span never adds new columns — it just eats existing slots, and whatever doesn't fit wraps to the next row. "Tracks as a budget each row spends" is the mental model that makes these layouts predictable.`,
      docRef: DOC,
    });
  },
};

const overflowPattern: Generator = {
  id: "tw-overflow",
  title: "Containing wide content",
  generate: (rng) => {
    const content = rng.pick(["a data table", "a code block", "an activity heatmap"]);
    return choice(rng, {
      genId: "tw-overflow",
      prompt: `On phones, ${content} is wider than the screen and makes the whole page scroll sideways. What's the right fix?`,
      correct: "Wrap it in a container with overflow-x-auto so it scrolls inside its own box",
      wrong: [
        "Add overflow-hidden to <body> to forbid page scrolling",
        "Give it w-screen so it matches the viewport width",
        "Use text-xs on phones until it fits",
      ],
      explanation:
        "Golden rule: **scroll the box, never the page.** The page body should never pan sideways — it makes headers drift and everything feel broken. Instead wrap the wide thing in its own scroll window with `overflow-x-auto` (usually plus `min-w-[…]` on the inner content so it stays legible), and only *that box* scrolls while the page stays put. `overflow-hidden` would silently clip data columns off the edge, and shrinking the text is a losing race against real content. You'll use this exact pattern in the problems table and the profile heatmap.",
      docRef: DOC,
    });
  },
};

export const tailwindTopic: Topic = {
  id: "tailwind",
  title: "Tailwind layout",
  icon: "🎨",
  blurb: "Mobile-first breakpoints, flex axes, the spacing scale, grid spans, dark variants and overflow patterns.",
  docSlug: "tailwind-responsive-design",
  docTitle: "Tailwind responsive design (Dojo guide)",
  generators: [
    breakpoints,
    flexAxis,
    spacingScale,
    darkVariant,
    gridSpan,
    overflowPattern,
    ...tailwindCodeGens,
  ],
};
