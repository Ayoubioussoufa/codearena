/**
 * Read-only highlighted code block (exercise snippets, model solutions).
 */
import { highlightToHtml } from "@/lib/highlight";

export function CodeBlock({
  code,
  language,
  className = "",
}: {
  code: string;
  language: string;
  className?: string;
}) {
  return (
    <pre
      className={`hljs-surface overflow-x-auto rounded-lg p-4 font-mono text-xs leading-6 ${className}`}
    >
      <code dangerouslySetInnerHTML={{ __html: highlightToHtml(code, language) }} />
    </pre>
  );
}
