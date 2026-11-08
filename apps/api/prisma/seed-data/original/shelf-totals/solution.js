// Prefix sums, O(n + q): prefix[i] is the total of the first i shelves, so any
// range is one subtraction away.
const data = require("fs").readFileSync(0, "utf8").split(/\s+/).filter(Boolean).map(Number);
const [n, q] = data;

const prefix = new Array(n + 1).fill(0);
for (let i = 1; i <= n; i++) {
  prefix[i] = prefix[i - 1] + data[1 + i];
}

const answers = [];
for (let i = 0; i < q; i++) {
  const left = data[2 + n + 2 * i];
  const right = data[3 + n + 2 * i];
  answers.push(prefix[right] - prefix[left - 1]);
}
console.log(answers.join("\n"));
