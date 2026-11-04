/**
 * Renders `backtick spans` as inline code and [text](https://…) as links, so
 * quiz and drill explanations can cite their sources. The course stylesheet
 * styles both.
 */
import { Fragment } from "react";

const TOKEN = /(`[^`]+`|\[[^\]]+\]\((?:https?:\/\/|\/)[^)\s]+\))/g;

export function Inline({ text }: { text: string }) {
  const parts = text.split(TOKEN);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
          return <code key={i}>{part.slice(1, -1)}</code>;
        }
        const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
        if (link) {
          const external = link[2]?.startsWith("http");
          return (
            <a key={i} href={link[2]} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
              {link[1]}
            </a>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
