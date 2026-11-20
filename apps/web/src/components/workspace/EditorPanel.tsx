/**
 * Right pane: toolbar, editor and output, wired to WorkspaceContext.
 */
"use client";

import { EditorToolbar } from "./EditorToolbar";
import { CodeEditor } from "./CodeEditor";
import { OutputPanel } from "./OutputPanel";
import { useWorkspace } from "./WorkspaceContext";

export function EditorPanel() {
  const workspace = useWorkspace();
  if (!workspace) return null;

  return (
    <div className="flex h-full flex-col gap-4">
      <EditorToolbar
        language={workspace.language}
        isRunning={workspace.isRunning}
        onLanguageChange={workspace.setLanguage}
        onRun={workspace.run}
        onReset={workspace.reset}
      />
      <CodeEditor
        language={workspace.language}
        value={workspace.code}
        onChange={workspace.setCode}
      />
      <OutputPanel result={workspace.result} isRunning={workspace.isRunning} />
    </div>
  );
}
