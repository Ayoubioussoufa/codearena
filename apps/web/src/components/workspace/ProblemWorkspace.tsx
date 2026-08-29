/**
 * src/components/workspace/ProblemWorkspace.tsx — two-pane workspace shell
 * TODOs: none — fully implemented scaffold.
 * (Server-safe composition: this just arranges the client pieces.)
 */
import type { Problem } from "@/lib/types";
import { WorkspaceProvider } from "./WorkspaceContext";
import { ProblemDescription } from "./ProblemDescription";
import { EditorPanel } from "./EditorPanel";

export function ProblemWorkspace({ problem }: { problem: Problem }) {
  return (
    <WorkspaceProvider problem={problem}>
      <div className="grid gap-6 lg:h-[calc(100vh-8.5rem)] lg:grid-cols-2">
        <div className="min-h-0 overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <ProblemDescription problem={problem} />
        </div>
        <div className="min-h-0">
          <EditorPanel />
        </div>
      </div>
    </WorkspaceProvider>
  );
}
