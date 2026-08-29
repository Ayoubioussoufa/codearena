/**
 * Runs user-written JS/TS-lite functions against test cases.
 *
 * In the browser the code executes inside a throwaway Web Worker with a hard
 * timeout, so an accidental `while(true)` can't freeze the page. In Node
 * (the fuzz/DSA scripts) it falls back to synchronous execution.
 *
 * A `Harness` lets tests pass serializable inputs (arrays) for problems whose
 * idiomatic signature is a TreeNode / ListNode: the runner builds the node
 * graph before calling, and serializes a node-graph result back to an array
 * for comparison. `TreeNode`/`ListNode` constructors are injected so learner
 * code can build nodes idiomatically.
 */

export type ArgKind = "raw" | "tree" | "list";

export interface Harness {
  /** Per-argument input kind (default "raw" for any position). */
  args?: ArgKind[];
  /** How to serialize the return value for comparison (default "raw"). */
  output?: ArgKind;
}

export interface FnTest {
  args: unknown[];
  expected: unknown;
  /** Absolute numeric tolerance; exact deep-equality when omitted. */
  approx?: number;
  /** Order-independent comparison at every array level (3Sum, group anagrams, …). */
  unordered?: boolean;
  /** Optional display label; defaults to fn(args) → expected. */
  show?: string;
}

export interface FnTestResult {
  label: string;
  passed: boolean;
  detail?: string;
}

/**
 * Pure, synchronous test execution. MUST be fully self-contained: it is
 * stringified via `.toString()` into a Web Worker, so it may not reference any
 * module-level binding (helpers, constants, imports) — everything it needs is
 * declared inside. `scripts/check-dsa.ts` reconstructs it in an isolated scope
 * to guarantee this.
 */
export function runTestsSync(
  code: string,
  fnName: string,
  tests: FnTest[],
  harness?: Harness,
): FnTestResult[] {
  // Injected before learner code so `new TreeNode(...)` / `new ListNode(...)` work.
  const NODE_PREAMBLE =
    "function TreeNode(val,left,right){this.val=(val===undefined?0:val);this.left=(left===undefined?null:left);this.right=(right===undefined?null:right);}" +
    "function ListNode(val,next){this.val=(val===undefined?0:val);this.next=(next===undefined?null:next);}";

  function isClose(a: unknown, b: unknown, tol: number): boolean {
    return (
      typeof a === "number" &&
      typeof b === "number" &&
      Number.isFinite(a) &&
      Math.abs(a - b) <= tol
    );
  }
  function deepEqual(a: unknown, b: unknown): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  function canon(v: unknown): string {
    if (Array.isArray(v)) {
      return "[" + v.map(canon).sort().join(",") + "]";
    }
    return JSON.stringify(v) ?? "null";
  }
  function unorderedEqual(a: unknown, b: unknown): boolean {
    return canon(a) === canon(b);
  }
  function display(v: unknown): string {
    const s = JSON.stringify(v);
    return s === undefined ? String(v) : s;
  }

  // ── node-graph builders / serializers (plain objects; shape matches the
  //    injected TreeNode/ListNode so learner-created nodes interoperate) ──
  function buildTree(arr: unknown): unknown {
    if (!Array.isArray(arr) || arr.length === 0 || arr[0] === null) return null;
    const root = { val: arr[0], left: null as unknown, right: null as unknown };
    const queue: { val: unknown; left: unknown; right: unknown }[] = [root];
    let i = 1;
    while (i < arr.length && queue.length) {
      const node = queue.shift() as { val: unknown; left: unknown; right: unknown };
      if (i < arr.length) {
        if (arr[i] !== null) {
          node.left = { val: arr[i], left: null, right: null };
          queue.push(node.left as { val: unknown; left: unknown; right: unknown });
        }
        i++;
      }
      if (i < arr.length) {
        if (arr[i] !== null) {
          node.right = { val: arr[i], left: null, right: null };
          queue.push(node.right as { val: unknown; left: unknown; right: unknown });
        }
        i++;
      }
    }
    return root;
  }
  function treeToArray(root: unknown): unknown[] {
    if (!root) return [];
    const out: unknown[] = [];
    const q: unknown[] = [root];
    let guard = 0;
    while (q.length && guard++ < 100000) {
      const node = q.shift() as { val: unknown; left: unknown; right: unknown } | null;
      if (node) {
        out.push(node.val);
        q.push(node.left);
        q.push(node.right);
      } else {
        out.push(null);
      }
    }
    while (out.length && out[out.length - 1] === null) out.pop();
    return out;
  }
  function buildList(arr: unknown): unknown {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const head = { val: arr[0], next: null as unknown };
    let cur = head;
    for (let i = 1; i < arr.length; i++) {
      const node = { val: arr[i], next: null as unknown };
      cur.next = node;
      cur = node;
    }
    return head;
  }
  function listToArray(head: unknown): unknown[] {
    const out: unknown[] = [];
    let cur = head as { val: unknown; next: unknown } | null;
    let guard = 0;
    while (cur && guard++ < 100000) {
      out.push(cur.val);
      cur = cur.next as { val: unknown; next: unknown } | null;
    }
    return out;
  }
  function toArg(value: unknown, kind: ArgKind): unknown {
    if (kind === "tree") return buildTree(value);
    if (kind === "list") return buildList(value);
    return value;
  }
  function fromOutput(value: unknown, kind: ArgKind): unknown {
    if (kind === "tree") return treeToArray(value);
    if (kind === "list") return listToArray(value);
    return value;
  }

  let fn: unknown;
  try {
    fn = new Function(
      `"use strict";\n${NODE_PREAMBLE}\n${code}\n;return typeof ${fnName} === "function" ? ${fnName} : undefined;`,
    )();
  } catch (error) {
    return [
      {
        label: `code compiles`,
        passed: false,
        detail: String(error instanceof Error ? error.message : error),
      },
    ];
  }
  if (typeof fn !== "function") {
    return [
      {
        label: `defines a function named ${fnName}`,
        passed: false,
        detail: `no function ${fnName} found`,
      },
    ];
  }

  const outputKind: ArgKind = harness?.output ?? "raw";

  return tests.map((t) => {
    const label =
      t.show ?? `${fnName}(${t.args.map(display).join(", ")}) → ${display(t.expected)}`;
    try {
      const callArgs = t.args.map((a, i) => toArg(a, harness?.args?.[i] ?? "raw"));
      const raw = (fn as (...a: unknown[]) => unknown)(...callArgs);
      const got = fromOutput(raw, outputKind);
      const passed =
        t.approx !== undefined
          ? isClose(got, t.expected, t.approx)
          : t.unordered
            ? unorderedEqual(got, t.expected)
            : deepEqual(got, t.expected);
      const result: FnTestResult = { label, passed };
      if (!passed) result.detail = `returned ${display(got)}`;
      return result;
    } catch (error) {
      return {
        label,
        passed: false,
        detail: `threw: ${String(error instanceof Error ? error.message : error)}`,
      };
    }
  });
}

const TIMEOUT_MS = 2000;

/** Browser path: run in a worker with a kill-switch; Node path: run sync. */
export function runTests(
  code: string,
  fnName: string,
  tests: FnTest[],
  harness?: Harness,
): Promise<FnTestResult[]> {
  if (typeof Worker === "undefined") {
    return Promise.resolve(runTestsSync(code, fnName, tests, harness));
  }

  // `var __name` shims esbuild/SWC's "keepNames" helper, which some bundlers
  // inject into function source — otherwise the stringified runner references
  // an undefined `__name` in the worker. Harmless if the bundler didn't add it.
  const workerSource = `
    var __name = function (f) { return f; };
    ${runTestsSync.toString()}
    self.onmessage = (e) => {
      const { code, fnName, tests, harness } = e.data;
      self.postMessage(runTestsSync(code, fnName, tests, harness));
    };
  `;
  const blobUrl = URL.createObjectURL(
    new Blob([workerSource], { type: "application/javascript" }),
  );

  return new Promise((resolve) => {
    const worker = new Worker(blobUrl);
    const timer = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
      resolve([
        {
          label: "finishes within 2 seconds",
          passed: false,
          detail: "timed out — check for an infinite loop",
        },
      ]);
    }, TIMEOUT_MS);
    worker.onmessage = (e: MessageEvent<FnTestResult[]>) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
      resolve(e.data);
    };
    worker.onerror = () => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
      resolve([{ label: "code runs", passed: false, detail: "worker error" }]);
    };
    worker.postMessage({ code, fnName, tests, harness });
  });
}
