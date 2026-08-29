/**
 * Client-side Mermaid renderer — lazy-loads the library, re-renders on theme
 * change, falls back to the raw code block on parse errors.
 */
"use client";

import { useEffect, useId, useState } from "react";
import { useIsDark } from "./theme";

export function MermaidDiagram({ code }: { code: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const isDark = useIsDark();
  const reactId = useId();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: isDark ? "dark" : "neutral",
        });
        const renderId = `mmd${reactId.replace(/[^a-zA-Z0-9]/g, "")}${isDark ? "d" : "l"}`;
        const { svg: rendered } = await mermaid.render(renderId, code);
        if (alive) {
          setSvg(rendered);
          setFailed(false);
        }
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [code, isDark, reactId]);

  if (failed) {
    return (
      <pre className="overflow-x-auto rounded-lg bg-slate-100 p-4 text-xs dark:bg-slate-900">
        <code>{code}</code>
      </pre>
    );
  }

  if (svg === null) {
    return (
      <div className="my-4 animate-pulse rounded-lg border border-dashed border-slate-300 p-8 text-center text-xs text-slate-400 dark:border-slate-700">
        Rendering diagram…
      </div>
    );
  }

  return (
    <div
      className="mermaid-diagram my-4 overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
