// Sliding window, O(n): the right end moves n times and the left end at most
// n times, because readings are positive, so shrinking never has to undo.
const data = require("fs").readFileSync(0, "utf8").split(/\s+/).filter(Boolean).map(Number);
const [n, k] = data;
const readings = data.slice(2);

let left = 0;
let sum = 0;
let best = 0;
for (let right = 0; right < n; right++) {
  sum += readings[right];
  while (sum > k) {
    sum -= readings[left];
    left++;
  }
  best = Math.max(best, right - left + 1);
}
console.log(best);
