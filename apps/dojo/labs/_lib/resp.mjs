// Given: a tiny Redis client. It speaks RESP, Redis's wire protocol: a command
// is an array of strings, "*<count>\r\n" then "$<bytes>\r\n<string>\r\n" each.
// Replies come back in order, so a FIFO of promises matches them up.
import net from "node:net";

export async function connect(port, host = "127.0.0.1") {
  const sock = net.createConnection({ port, host });
  await new Promise((resolve, reject) => { sock.once("connect", resolve); sock.once("error", reject); });
  let buf = Buffer.alloc(0);
  const pending = [];
  sock.on("data", (d) => {
    buf = Buffer.concat([buf, d]);
    for (;;) {
      const r = parse(buf, 0);
      if (!r) break;
      buf = buf.subarray(r.end);
      const p = pending.shift();
      if (r.value instanceof Error) p.reject(r.value); else p.resolve(r.value);
    }
  });
  sock.on("error", (e) => { while (pending.length) pending.shift().reject(e); });
  return {
    /** Sends one command, e.g. cmd("LPUSH", "q", "job"), and resolves with Redis's reply. */
    cmd(...args) {
      return new Promise((resolve, reject) => { pending.push({ resolve, reject }); sock.write(encode(args)); });
    },
    close() { sock.end(); },
  };
}

function encode(args) {
  let out = `*${args.length}\r\n`;
  for (const a of args) { const s = String(a); out += `$${Buffer.byteLength(s)}\r\n${s}\r\n`; }
  return out;
}

function parse(buf, i) {
  if (i >= buf.length) return null;
  const nl = buf.indexOf("\r\n", i);
  if (nl < 0) return null;
  const type = String.fromCharCode(buf[i]);
  const line = buf.toString("utf8", i + 1, nl);
  const next = nl + 2;
  if (type === "+") return { value: line, end: next };
  if (type === "-") return { value: new Error(line), end: next };
  if (type === ":") return { value: Number(line), end: next };
  if (type === "$") {
    const n = Number(line);
    if (n < 0) return { value: null, end: next };
    if (buf.length < next + n + 2) return null;
    return { value: buf.toString("utf8", next, next + n), end: next + n + 2 };
  }
  if (type === "*") {
    const n = Number(line);
    if (n < 0) return { value: null, end: next };
    const out = [];
    let p = next;
    for (let k = 0; k < n; k++) { const r = parse(buf, p); if (!r) return null; out.push(r.value); p = r.end; }
    return { value: out, end: p };
  }
  throw new Error(`unexpected RESP type ${type}`);
}
