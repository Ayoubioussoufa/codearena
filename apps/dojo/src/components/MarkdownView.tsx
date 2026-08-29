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

export function MarkdownView({ markdown }: { markdown: string }) {
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
