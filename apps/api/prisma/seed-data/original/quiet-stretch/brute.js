// Every start, extended as far as it goes: O(n²). Correct, but too slow.
const data = require("fs").readFileSync(0, "utf8").split(/\s+/).filter(Boolean).map(Number);
const [n, k] = data;
const readings = data.slice(2);

let best = 0;
for (let start = 0; start < n; start++) {
  let sum = 0;
  for (let end = start; end < n; end++) {
    sum += readings[end];
    if (sum > k) break;
    best = Math.max(best, end - start + 1);
  }
}
console.log(best);
