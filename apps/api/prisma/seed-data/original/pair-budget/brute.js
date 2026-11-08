// Looks at every pair: O(n²). Correct, but too slow.
const data = require("fs").readFileSync(0, "utf8").split(/\s+/).filter(Boolean).map(Number);
const [n, budget] = data;
const prices = data.slice(2);

let pairs = 0;
for (let i = 0; i < n; i++) {
  for (let j = i + 1; j < n; j++) {
    if (prices[i] + prices[j] <= budget) pairs++;
  }
}
console.log(pairs);
