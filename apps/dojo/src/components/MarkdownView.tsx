/**
 * Guide markdown renderer: GFM + heading anchors, mermaid fences rendered as
 * diagrams, ````walkthrough fences rendered as closed toggles, relative .md
 * links rewritten to /guides routes, tables wrapped in scroll containers.
 * Runs in server components.
 */
import { isValidElement, type ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { MermaidDiagram } from "./MermaidDiagram";
import { GuideExercise } from "./GuideExercise";
import { getGuideExercise } from "@/lib/guide-exercises";
import { SimBlock } from "./sims/SimBlock";
import { GuideCheckBlock } from "./courses/GuideCheckBlock";
import { getGuideCheck } from "@/lib/guide-checks";

function textOf(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) {
    return textOf((node.props as { children?: ReactNode }).children);
  }
  return "";
}

function rewriteHref(href: string): string {
  const md = href.match(/^\.\/([\w-]+)\.md(#.*)?$/);
  if (md) return `/guides/${md[1]}${md[2] ?? ""}`;
  return href;
}

export function MarkdownView({
  markdown,
  guideSlug,
}: {
  markdown: string;
  /** Enables ```exercise and ```check fences, which are looked up per guide. */
  guideSlug?: string | undefined;
}) {
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-pre:overflow-x-auto">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeHighlight, { detect: false, plainText: ["mermaid", "text", "txt", "walkthrough"] }],
        ]}
        components={{
          pre: (props) => {
            const child = props.children;
            if (isValidElement(child)) {
              const { className, children } = child.props as {
                className?: string;
                children?: ReactNode;
              };
              if (className?.includes("language-mermaid")) {
                return <MermaidDiagram code={textOf(children).trim()} />;
              }
              // ```check fences hold a check id: multiple choice + one written
              // question, defined in src/lib/guide-checks.
              if (className?.includes("language-check") && guideSlug) {
                const id = textOf(children).trim();
                const check = getGuideCheck(guideSlug, id);
                if (check) return <GuideCheckBlock slug={guideSlug} check={check} />;
                return (
                  <pre className="not-prose rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
                    Unknown check: {guideSlug}:{id}
                  </pre>
                );
              }
              // ````walkthrough fences hold markdown (four backticks, so code
              // blocks fit inside). Closed by default: the full answer for a
              // step, opened only when you're stuck. An optional first line
              // `title: …` names it.
              if (className?.includes("language-walkthrough")) {
                const raw = textOf(children).replace(/\n$/, "");
                const [first = "", ...rest] = raw.split("\n");
                const titled = first.startsWith("title:");
                const title = titled ? first.slice("title:".length).trim() : "";
                const body = titled ? rest.join("\n") : raw;
                return (
                  <details className="walkthrough not-prose group my-5 rounded-xl border border-amber-300 bg-amber-50/60 dark:border-amber-700/60 dark:bg-amber-950/20">
                    <summary className="flex cursor-pointer select-none list-none items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-amber-900 hover:bg-amber-100/70 dark:text-amber-200 dark:hover:bg-amber-900/30 [&::-webkit-details-marker]:hidden">
                      <span className="rounded-md bg-amber-500 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white dark:bg-amber-600">
                        <span className="group-open:hidden">Show walkthrough</span>
                        <span className="hidden group-open:inline">Hide walkthrough</span>
                      </span>
                      <span>{title || "The full answer, step by step"}</span>
                      <span className="ml-auto text-xs font-normal text-amber-700/80 dark:text-amber-300/70">
                        try first, open when stuck
                      </span>
                    </summary>
                    <div className="border-t border-amber-200 px-4 pb-2 pt-1 dark:border-amber-800/60">
                      <MarkdownView markdown={body} guideSlug={guideSlug} />
                    </div>
                  </details>
                );
              }
              // ```sim fences hold a station id, or "map": playable simulations
              // defined in src/lib/sims and checked by scripts/check-sims.ts.
              if (className?.includes("language-sim")) {
                return <SimBlock id={textOf(children).trim()} guide={guideSlug} />;
              }
              // ```exercise fences hold an exercise id; the definition lives in
              // src/lib/guide-exercises so its checks can be real code and the
              // whole set can be verified by a script.
              if (className?.includes("language-exercise") && guideSlug) {
                const id = textOf(children).trim();
                const exercise = getGuideExercise(guideSlug, id);
                if (exercise) return <GuideExercise exercise={exercise} />;
                return (
                  <pre className="not-prose rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
                    Unknown exercise: {guideSlug}:{id}
                  </pre>
                );
              }
            }
            return <pre {...props} />;
          },
          a: ({ href, children, ...rest }) => (
            <a href={href ? rewriteHref(href) : undefined} {...rest}>
              {children}
            </a>
          ),
          table: (props) => (
            <div className="overflow-x-auto">
              <table {...props} />
            </div>
          ),
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
}
