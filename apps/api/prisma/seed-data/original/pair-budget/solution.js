// Sort, then two pointers, O(n log n): if the cheapest item fits with the most
// expensive one, it fits with everything between them too.
const data = require("fs").readFileSync(0, "utf8").split(/\s+/).filter(Boolean).map(Number);
const [n, budget] = data;
const prices = Float64Array.from(data.slice(2)).sort();

let pairs = 0;
let low = 0;
let high = n - 1;
while (low < high) {
  if (prices[low] + prices[high] <= budget) {
    pairs += high - low;
    low++;
  } else {
    high--;
  }
}
console.log(pairs);
