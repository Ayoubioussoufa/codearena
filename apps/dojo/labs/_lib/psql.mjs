// Shared by the Postgres labs: run SQL through psql inside the lab's container.
import { spawn } from "node:child_process";

/** Resolves with psql's output lines (unaligned, tuples only). Rejects with psql's error. */
export function psql(sql, vars = {}, { container = process.env.PG_CONTAINER } = {}) {
  if (!container) throw new Error("No Postgres container: run the lab with bash check.sh");
  return new Promise((resolve, reject) => {
    const args = ["exec", "-i", container, "psql", "-U", "lab", "-d", "lab", "-q", "-t", "-A", "-v", "ON_ERROR_STOP=1"];
    for (const [k, v] of Object.entries(vars)) args.push("-v", `${k}=${v}`);
    args.push("-f", "-");
    const p = spawn("docker", args);
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) => (code === 0 ? resolve(out.split("\n").map((l) => l.trim()).filter(Boolean)) : reject(new Error(err.trim() || `psql exited ${code}`))));
    p.stdin.end(sql);
  });
}

/** EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) a query; resolves with { plan, nodes, ms, buffers }. */
export async function explain(query) {
  const json = (await psql(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`)).join("\n");
  const [root] = JSON.parse(json);
  const nodes = [];
  const walk = (n) => { nodes.push(n); for (const c of n.Plans ?? []) walk(c); };
  walk(root.Plan);
  const buffers = (root.Plan["Shared Hit Blocks"] ?? 0) + (root.Plan["Shared Read Blocks"] ?? 0);
  return { plan: root.Plan, nodes, ms: root["Execution Time"], buffers };
}

/** A compact one-line view of a plan: node types, outermost first. */
export function shape(nodes) {
  return nodes.map((n) => `${n["Node Type"]}${n["Index Name"] ? `(${n["Index Name"]})` : n["Relation Name"] ? `(${n["Relation Name"]})` : ""}`).join(" → ");
}
