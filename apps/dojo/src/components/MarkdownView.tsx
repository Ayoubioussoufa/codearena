/**
 * Guide markdown renderer: GFM + heading anchors, mermaid fences rendered as
 * diagrams, relative .md links rewritten to /guides routes, tables wrapped in
 * scroll containers. Runs in server components.
 */
import { isValidElement, type ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { MermaidDiagram } from "./MermaidDiagram";
import { GuideExercise } from "./GuideExercise";
import { getGuideExercise } from "@/lib/guide-exercises";

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
  /** Enables ```exercise fences, which are looked up per guide. */
  guideSlug?: string;
}) {
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-pre:overflow-x-auto">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeHighlight, { detect: false, plainText: ["mermaid", "text", "txt"] }],
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
