/**
 * highlight.js core with only the languages the dojo uses. Isomorphic —
 * used by client components (editor, exercise blocks); guides are highlighted
 * server-side by rehype-highlight with the same token classes/CSS.
 */
import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
import javascript from "highlight.js/lib/languages/javascript";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import sql from "highlight.js/lib/languages/sql";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import graphql from "highlight.js/lib/languages/graphql";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import properties from "highlight.js/lib/languages/properties";
import plaintext from "highlight.js/lib/languages/plaintext";
import rust from "highlight.js/lib/languages/rust";

hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("json", json);
hljs.registerLanguage("graphql", graphql);
hljs.registerLanguage("python", python);
hljs.registerLanguage("java", java);
hljs.registerLanguage("properties", properties);
hljs.registerLanguage("plaintext", plaintext);
hljs.registerLanguage("rust", rust);

const ALIASES: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  html: "xml",
  prisma: "graphql", // closest built-in grammar to Prisma schema files
  shell: "bash",
  text: "plaintext",
  rs: "rust",
};

export function highlightToHtml(code: string, language: string): string {
  const lang = ALIASES[language] ?? language;
  try {
    if (hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
  } catch {
    /* fall through to escaped plaintext */
  }
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
