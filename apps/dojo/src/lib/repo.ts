/**
 * Monorepo root discovery (server-only). Shared by the guide loader and the
 * apps/web build-bridge scanner.
 */
import fs from "node:fs";
import path from "node:path";

function findRepoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    if (
      fs.existsSync(path.join(dir, "pnpm-workspace.yaml")) &&
      fs.existsSync(path.join(dir, "docs"))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

export const REPO_ROOT = findRepoRoot();
