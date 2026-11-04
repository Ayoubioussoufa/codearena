/**
 * A lesson's HTML body, made interactive: build-step ticks that persist,
 * copy buttons on code blocks, client-side navigation for internal links,
 * and folded answers that open when the page is printed.
 *
 * The HTML is authored in this repo (content/courses/), so it's trusted.
 */
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { lessonProgress, setStep, useCourseProgress } from "@/lib/courses/progress";

const STEP_BOXES = '.step input[type="checkbox"][data-key]';

export function LessonBody({ slug, html }: { slug: string; html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const steps = lessonProgress(useCourseProgress(), slug).steps;

  // Wire the DOM once per lesson.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const onChange = (event: Event) => {
      const box = event.target as HTMLInputElement;
      if (box.matches(STEP_BOXES) && box.dataset.key) setStep(slug, box.dataset.key, box.checked);
    };

    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element).closest("a");
      const href = link?.getAttribute("href");
      if (!link || !href?.startsWith("/") || link.target) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      router.push(href);
    };

    root.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector(".copy")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy";
      button.textContent = "copy";
      button.addEventListener("click", () => {
        const text = Array.from(pre.childNodes)
          .filter((node) => node !== button)
          .map((node) => node.textContent ?? "")
          .join("")
          .trimEnd();
        navigator.clipboard?.writeText(text).then(
          () => {
            button.textContent = "copied";
            window.setTimeout(() => (button.textContent = "copy"), 1200);
          },
          () => (button.textContent = "select it"),
        );
      });
      pre.appendChild(button);
    });

    const openAll = () => root.querySelectorAll("details").forEach((d) => (d.open = true));

    root.addEventListener("change", onChange);
    root.addEventListener("click", onClick);
    window.addEventListener("beforeprint", openAll);
    return () => {
      root.removeEventListener("change", onChange);
      root.removeEventListener("click", onClick);
      window.removeEventListener("beforeprint", openAll);
    };
  }, [slug, router]);

  // Reflect the stored ticks into the checkboxes.
  useEffect(() => {
    ref.current?.querySelectorAll<HTMLInputElement>(STEP_BOXES).forEach((box) => {
      box.checked = box.dataset.key ? steps[box.dataset.key] === true : false;
      box.closest(".step")?.classList.toggle("done", box.checked);
    });
  }, [steps]);

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
}
