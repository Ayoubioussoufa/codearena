// Adds up each query's shelves one by one: O(n × q). Correct, but too slow.
const data = require("fs").readFileSync(0, "utf8").split(/\s+/).filter(Boolean).map(Number);
const [n, q] = data;

const answers = [];
for (let i = 0; i < q; i++) {
  const left = data[2 + n + 2 * i];
  const right = data[3 + n + 2 * i];
  let total = 0;
  for (let shelf = left; shelf <= right; shelf++) {
    total += data[1 + shelf];
  }
  answers.push(total);
}
console.log(answers.join("\n"));
