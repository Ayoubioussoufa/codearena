/**
 * DSA — Tries (prefix trees). A tree keyed by characters: one node per
 * prefix. Everything that starts with "shared prefixes" — autocomplete,
 * dictionaries, wildcard search, even XOR on bits — lives here.
 */
import type { DsaCategory } from "../types";

export const tries: DsaCategory = {
  id: "tries",
  title: "Tries",
  icon: "🔤",
  docAnchor: "tries",
  blurb:
    "One tree node per prefix: dictionaries, autocomplete, wildcard matching, and the bitwise-XOR trick.",
  problems: [
    {
      slug: "longest-common-prefix",
      title: "Longest Common Prefix",
      difficulty: "Easy",
      category: "tries",
      blurb: "The shared prefix of every string in an array.",
      statement: [
        "Return the longest common prefix of all strings in `strs` (\"\" if there is none).",
      ],
      examples: [
        { input: "strs = [\"flower\",\"flow\",\"flight\"]", output: "\"fl\"" },
        { input: "strs = [\"dog\",\"racecar\",\"car\"]", output: "\"\"" },
      ],
      constraints: ["1 <= strs.length <= 200", "0 <= strs[i].length <= 200"],
      fnName: "longestCommonPrefix",
      starter: "function longestCommonPrefix(strs) {\n  \n}",
      solution:
        "function longestCommonPrefix(strs) {\n  let prefix = strs[0];\n  for (let i = 1; i < strs.length; i++) {\n    while (!strs[i].startsWith(prefix)) {\n      prefix = prefix.slice(0, -1);\n      if (prefix === \"\") return \"\";\n    }\n  }\n  return prefix;\n}",
      tests: [
        { args: [["flower", "flow", "flight"]], expected: "fl" },
        { args: [["dog", "racecar", "car"]], expected: "" },
        { args: [["alone"]], expected: "alone" },
        { args: [["ab", "a"]], expected: "a" },
      ],
      approach:
        "The warm-up that motivates the whole category: take the first string as the candidate prefix and shrink it until every string starts with it. Simple and O(total chars) in practice. Now picture the same data IN A TRIE: the common prefix is exactly the unbranching chain from the root — walk down while each node has one child and no word-end. Holding both pictures (string-shrinking vs. tree-path) is what makes trie problems start to look easy.",
      docAnchor: "tries",
    },
    {
      slug: "implement-trie",
      title: "Implement Trie (Prefix Tree)",
      difficulty: "Medium",
      category: "tries",
      blurb: "insert / search / startsWith — the data structure itself.",
      statement: [
        "Implement a trie by processing a list of operations. `ops` is an array of operation names (`\"insert\"`, `\"search\"`, `\"startsWith\"`) and `args[i]` holds the argument for `ops[i]`. Return an array with each operation's result (`null` for insert, boolean for the queries).",
        "`search(word)` is true only if the exact word was inserted; `startsWith(prefix)` is true if ANY inserted word begins with the prefix.",
      ],
      examples: [
        {
          input: "ops = [\"insert\",\"search\",\"search\",\"startsWith\",\"insert\",\"search\"], args = [[\"apple\"],[\"apple\"],[\"app\"],[\"app\"],[\"app\"],[\"app\"]]",
          output: "[null,true,false,true,null,true]",
        },
      ],
      constraints: ["1 <= word.length <= 2000", "Lowercase letters only"],
      fnName: "trieOps",
      starter: "function trieOps(ops, args) {\n  \n}",
      solution:
        "function trieOps(ops, args) {\n  const root = {};\n  const res = [];\n  for (let i = 0; i < ops.length; i++) {\n    const word = args[i][0];\n    if (ops[i] === \"insert\") {\n      let node = root;\n      for (const ch of word) node = node[ch] || (node[ch] = {});\n      node.$ = true;\n      res.push(null);\n    } else {\n      let node = root;\n      let found = true;\n      for (const ch of word) {\n        if (!node[ch]) {\n          found = false;\n          break;\n        }\n        node = node[ch];\n      }\n      if (ops[i] === \"search\") res.push(found && node.$ === true);\n      else res.push(found);\n    }\n  }\n  return res;\n}",
      tests: [
        {
          args: [["insert", "search", "search", "startsWith", "insert", "search"], [["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]]],
          expected: [null, true, false, true, null, true],
        },
        {
          args: [["insert", "startsWith", "search"], [["dojo"], ["do"], ["do"]]],
          expected: [null, true, false],
        },
        {
          args: [["search", "startsWith"], [["a"], ["a"]]],
          expected: [false, false],
        },
      ],
      approach:
        "The trie in its rawest form: each node is a plain object mapping character → child node, plus an end-of-word flag (here `$`, a key no lowercase letter collides with). Insert walks the word creating missing children; search walks and then checks the flag; startsWith is the same walk WITHOUT the flag check — that one-line difference is the whole distinction between 'word' and 'prefix'. Every other problem in this category is this structure plus one extra idea.",
      docAnchor: "tries",
    },
    {
      slug: "design-add-and-search-words",
      title: "Design Add and Search Words",
      difficulty: "Medium",
      category: "tries",
      blurb: "Dictionary search where '.' matches any letter.",
      statement: [
        "Process operations on a word dictionary: `\"addWord\"` stores a word; `\"search\"` returns whether any stored word matches the query, where `.` matches exactly one arbitrary character. Return each operation's result (`null` for adds).",
      ],
      examples: [
        {
          input: "ops = [\"addWord\",\"addWord\",\"addWord\",\"search\",\"search\",\"search\",\"search\"], args = [[\"bad\"],[\"dad\"],[\"mad\"],[\"pad\"],[\"bad\"],[\".ad\"],[\"b..\"]]",
          output: "[null,null,null,false,true,true,true]",
        },
      ],
      constraints: ["1 <= word.length <= 25", "Search may contain '.'"],
      fnName: "wordDictionary",
      starter: "function wordDictionary(ops, args) {\n  \n}",
      solution:
        "function wordDictionary(ops, args) {\n  const root = {};\n  const res = [];\n  function search(node, word, i) {\n    if (!node) return false;\n    if (i === word.length) return node.$ === true;\n    const ch = word[i];\n    if (ch === \".\") {\n      for (const key in node) {\n        if (key !== \"$\" && search(node[key], word, i + 1)) return true;\n      }\n      return false;\n    }\n    return search(node[ch], word, i + 1);\n  }\n  for (let k = 0; k < ops.length; k++) {\n    const w = args[k][0];\n    if (ops[k] === \"addWord\") {\n      let node = root;\n      for (const ch of w) node = node[ch] || (node[ch] = {});\n      node.$ = true;\n      res.push(null);\n    } else {\n      res.push(search(root, w, 0));\n    }\n  }\n  return res;\n}",
      tests: [
        {
          args: [
            ["addWord", "addWord", "addWord", "search", "search", "search", "search"],
            [["bad"], ["dad"], ["mad"], ["pad"], ["bad"], [".ad"], ["b.."]],
          ],
          expected: [null, null, null, false, true, true, true],
        },
        {
          args: [["addWord", "search", "search"], [["a"], ["."], ["aa"]]],
          expected: [null, true, false],
        },
        {
          args: [["search"], [["."]]],
          expected: [false],
        },
      ],
      approach:
        "The wildcard turns a linear trie walk into a BRANCHING one: on a normal letter, follow that single child; on '.', try every child and succeed if any branch matches — which is a DFS over the trie. This trie+DFS composition (walk the structure, fan out on choice points) is the exact engine that Word Search II runs on a grid. Worst case is exponential in dots, but real queries have few, and the trie prunes dead branches immediately.",
      docAnchor: "tries",
    },
    {
      slug: "replace-words",
      title: "Replace Words",
      difficulty: "Medium",
      category: "tries",
      blurb: "Replace each word with its shortest dictionary root.",
      statement: [
        "Given a `dictionary` of roots and a `sentence`, replace every word that starts with a root by its SHORTEST root. Return the sentence.",
      ],
      examples: [
        { input: "dictionary = [\"cat\",\"bat\",\"rat\"], sentence = \"the cattle was rattled by the battery\"", output: "\"the cat was rat by the bat\"" },
        { input: "dictionary = [\"a\",\"b\",\"c\"], sentence = \"aadsfasf absbs bbab cadsfafs\"", output: "\"a a b c\"" },
      ],
      constraints: ["1 <= dictionary.length <= 1000", "1 <= sentence words <= 1000"],
      fnName: "replaceWords",
      starter: "function replaceWords(dictionary, sentence) {\n  \n}",
      solution:
        "function replaceWords(dictionary, sentence) {\n  const roots = new Set(dictionary);\n  return sentence\n    .split(\" \")\n    .map((w) => {\n      for (let i = 1; i <= w.length; i++) {\n        if (roots.has(w.slice(0, i))) return w.slice(0, i);\n      }\n      return w;\n    })\n    .join(\" \");\n}",
      tests: [
        { args: [["cat", "bat", "rat"], "the cattle was rattled by the battery"], expected: "the cat was rat by the bat" },
        { args: [["a", "b", "c"], "aadsfasf absbs bbab cadsfafs"], expected: "a a b c" },
        { args: [["catt", "cat"], "the cattle"], expected: "the cat" },
      ],
      approach:
        "Checking prefixes shortest-first automatically yields the shortest root — the set version shown here tries each of the word's prefixes against a hash set, O(L²) per word from the slicing. A trie does it in O(L): walk the word's characters down the root-trie and stop at the FIRST end-of-word flag. Same shortest-first guarantee, no slicing. When prefix queries repeat against one fixed dictionary, the trie converts per-query prefix enumeration into a single walk — that's its core economic argument.",
      docAnchor: "tries",
    },
    {
      slug: "longest-word-in-dictionary",
      title: "Longest Word in Dictionary",
      difficulty: "Medium",
      category: "tries",
      blurb: "Longest word buildable one letter at a time from other words.",
      statement: [
        "Return the longest word in `words` that can be built one character at a time, where EVERY prefix of it is also a word in the list. Ties go to the lexicographically smallest word; return \"\" if none qualifies.",
      ],
      examples: [
        { input: "words = [\"w\",\"wo\",\"wor\",\"worl\",\"world\"]", output: "\"world\"" },
        { input: "words = [\"a\",\"banana\",\"app\",\"appl\",\"ap\",\"apply\",\"apple\"]", output: "\"apple\"", explanation: "Both apply and apple reach length 5; apple wins alphabetically." },
      ],
      constraints: ["1 <= words.length <= 1000"],
      fnName: "longestWord",
      starter: "function longestWord(words) {\n  \n}",
      solution:
        "function longestWord(words) {\n  const sorted = [...words].sort();\n  const buildable = new Set();\n  let best = \"\";\n  for (const w of sorted) {\n    if (w.length === 1 || buildable.has(w.slice(0, -1))) {\n      buildable.add(w);\n      if (w.length > best.length) best = w;\n    }\n  }\n  return best;\n}",
      tests: [
        { args: [["w", "wo", "wor", "worl", "world"]], expected: "world" },
        { args: [["a", "banana", "app", "appl", "ap", "apply", "apple"]], expected: "apple" },
        { args: [["yo", "ew", "fc", "zrc"]], expected: "" },
      ],
      approach:
        "Sorting does double duty: shorter prefixes come before their extensions (so by the time you see 'appl', 'app' has already been judged), and alphabetical order makes the FIRST longest hit the tie-winner. A word is buildable iff its one-shorter prefix is. The trie view: insert all words, then DFS only through nodes carrying an end-of-word flag — the deepest all-flagged path is the answer. Both run in O(total letters); the sorted-set version is shorter to write, the trie version generalizes better.",
      docAnchor: "tries",
    },
    {
      slug: "map-sum-pairs",
      title: "Map Sum Pairs",
      difficulty: "Medium",
      category: "tries",
      blurb: "Insert key→value; sum all values whose key starts with a prefix.",
      statement: [
        "Process operations: `\"insert\"` stores a key with a value (overwriting an existing key), `\"sum\"` returns the sum of values of ALL keys starting with the given prefix. Return each operation's result (`null` for insert).",
      ],
      examples: [
        {
          input: "ops = [\"insert\",\"sum\",\"insert\",\"sum\"], args = [[\"apple\",3],[\"ap\"],[\"app\",2],[\"ap\"]]",
          output: "[null,3,null,5]",
        },
      ],
      constraints: ["1 <= key.length <= 50", "Values are integers"],
      fnName: "mapSum",
      starter: "function mapSum(ops, args) {\n  \n}",
      solution:
        "function mapSum(ops, args) {\n  const entries = new Map();\n  const res = [];\n  for (let i = 0; i < ops.length; i++) {\n    if (ops[i] === \"insert\") {\n      entries.set(args[i][0], args[i][1]);\n      res.push(null);\n    } else {\n      const prefix = args[i][0];\n      let sum = 0;\n      for (const [k, v] of entries) {\n        if (k.startsWith(prefix)) sum += v;\n      }\n      res.push(sum);\n    }\n  }\n  return res;\n}",
      tests: [
        {
          args: [["insert", "sum", "insert", "sum"], [["apple", 3], ["ap"], ["app", 2], ["ap"]]],
          expected: [null, 3, null, 5],
        },
        {
          args: [["insert", "sum", "insert", "sum"], [["apple", 3], ["ap"], ["apple", 2], ["ap"]]],
          expected: [null, 3, null, 2],
        },
        {
          args: [["sum"], [["x"]]],
          expected: [0],
        },
      ],
      approach:
        "The scan-the-map version shown is O(keys) per sum — fine at this scale, and it nails the overwrite semantics via Map.set. The trie upgrade: store at every node the running sum of all values below it; insert walks the key adding (newValue − oldValue) to each node on the path, and sum becomes a single walk to the prefix node, O(L). Caching AGGREGATES on internal trie nodes — sums, counts, max — is the technique to remember; it's how autocomplete ranks suggestions without rescanning.",
      docAnchor: "tries",
    },
    {
      slug: "lexicographical-numbers",
      title: "Lexicographical Numbers",
      difficulty: "Medium",
      category: "tries",
      blurb: "1..n in dictionary order — walk the implicit digit trie.",
      statement: [
        "Return the numbers 1..n sorted in LEXICOGRAPHICAL order (as strings would sort: 1, 10, 11, …, 2, 20, …), in O(n) time without sorting.",
      ],
      examples: [
        { input: "n = 13", output: "[1,10,11,12,13,2,3,4,5,6,7,8,9]" },
        { input: "n = 2", output: "[1,2]" },
      ],
      constraints: ["1 <= n <= 5 * 10^4"],
      fnName: "lexicalOrder",
      starter: "function lexicalOrder(n) {\n  \n}",
      solution:
        "function lexicalOrder(n) {\n  const res = [];\n  let cur = 1;\n  for (let i = 0; i < n; i++) {\n    res.push(cur);\n    if (cur * 10 <= n) {\n      cur *= 10;\n    } else {\n      while (cur % 10 === 9 || cur + 1 > n) cur = Math.floor(cur / 10);\n      cur++;\n    }\n  }\n  return res;\n}",
      tests: [
        { args: [13], expected: [1, 10, 11, 12, 13, 2, 3, 4, 5, 6, 7, 8, 9] },
        { args: [2], expected: [1, 2] },
        { args: [25], expected: [1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 3, 4, 5, 6, 7, 8, 9] },
      ],
      approach:
        "The numbers 1..n form an IMPLICIT 10-ary trie: node x has children x·10 … x·10+9, and lexicographical order is exactly this trie's pre-order traversal. The iterative walk: go deeper (×10) when allowed; otherwise move to the next sibling (+1), climbing up (÷10) first whenever the current node is a 9-child or the sibling would exceed n. No trie is ever built — recognizing trie SHAPE in numeric structure is the leap this problem teaches, and it's the same leap the XOR problem asks for with bits.",
      docAnchor: "tries",
    },
    {
      slug: "search-suggestions-system",
      title: "Search Suggestions System",
      difficulty: "Medium",
      category: "tries",
      blurb: "Autocomplete: top 3 products after each typed character.",
      statement: [
        "Given `products` and a `searchWord`, return for each prefix of `searchWord` (as the user types it) the three lexicographically smallest products starting with that prefix.",
      ],
      examples: [
        {
          input: "products = [\"mobile\",\"mouse\",\"moneypot\",\"monitor\",\"mousepad\"], searchWord = \"mouse\"",
          output: "[[\"mobile\",\"moneypot\",\"monitor\"],[\"mobile\",\"moneypot\",\"monitor\"],[\"mouse\",\"mousepad\"],[\"mouse\",\"mousepad\"],[\"mouse\",\"mousepad\"]]",
        },
        { input: "products = [\"havana\"], searchWord = \"havana\"", output: "[[\"havana\"],[\"havana\"],[\"havana\"],[\"havana\"],[\"havana\"],[\"havana\"]]" },
      ],
      constraints: ["1 <= products.length <= 1000", "1 <= searchWord.length <= 1000"],
      fnName: "suggestedProducts",
      starter: "function suggestedProducts(products, searchWord) {\n  \n}",
      solution:
        "function suggestedProducts(products, searchWord) {\n  const sorted = [...products].sort();\n  const res = [];\n  let prefix = \"\";\n  for (const ch of searchWord) {\n    prefix += ch;\n    const matches = [];\n    for (const p of sorted) {\n      if (p.startsWith(prefix)) {\n        matches.push(p);\n        if (matches.length === 3) break;\n      }\n    }\n    res.push(matches);\n  }\n  return res;\n}",
      tests: [
        {
          args: [["mobile", "mouse", "moneypot", "monitor", "mousepad"], "mouse"],
          expected: [
            ["mobile", "moneypot", "monitor"],
            ["mobile", "moneypot", "monitor"],
            ["mouse", "mousepad"],
            ["mouse", "mousepad"],
            ["mouse", "mousepad"],
          ],
        },
        { args: [["havana"], "havana"], expected: [["havana"], ["havana"], ["havana"], ["havana"], ["havana"], ["havana"]] },
        { args: [["bags", "baggage", "banner", "box", "cloths"], "bags"], expected: [["baggage", "bags", "banner"], ["baggage", "bags", "banner"], ["baggage", "bags"], ["bags"]] },
      ],
      approach:
        "This IS autocomplete. Sort once; then for each prefix collect the first ≤3 matches — sorted order makes them automatically the lexicographically smallest. The trie version stores at each node its 3 best completions (an aggregate, like Map Sum's node sums), making each keystroke O(1) after the walk; production autocompletes do exactly that with popularity-ranked lists. A binary-search refinement of the sorted version (jump straight to the prefix's insertion point) is a nice middle ground — three implementations, one spectrum of trade-offs.",
      docAnchor: "tries",
    },
    {
      slug: "maximum-xor-of-two-numbers",
      title: "Maximum XOR of Two Numbers in an Array",
      difficulty: "Medium",
      category: "tries",
      blurb: "Best pairwise XOR via the binary trie idea.",
      statement: [
        "Return the maximum value of `nums[i] XOR nums[j]` over all pairs (i may equal j).",
      ],
      examples: [
        { input: "nums = [3,10,5,25,2,8]", output: "28", explanation: "5 XOR 25 = 28." },
        { input: "nums = [0]", output: "0" },
      ],
      constraints: ["1 <= nums.length <= 2 * 10^5", "0 <= nums[i] <= 2^31 - 1"],
      fnName: "findMaximumXOR",
      starter: "function findMaximumXOR(nums) {\n  \n}",
      solution:
        "function findMaximumXOR(nums) {\n  let max = 0;\n  let mask = 0;\n  for (let bit = 30; bit >= 0; bit--) {\n    mask |= 1 << bit;\n    const prefixes = new Set();\n    for (const n of nums) prefixes.add(n & mask);\n    const candidate = max | (1 << bit);\n    for (const p of prefixes) {\n      if (prefixes.has(candidate ^ p)) {\n        max = candidate;\n        break;\n      }\n    }\n  }\n  return max;\n}",
      tests: [
        { args: [[3, 10, 5, 25, 2, 8]], expected: 28 },
        { args: [[0]], expected: 0 },
        { args: [[14, 70, 53, 83, 49, 91, 36, 80, 92, 51, 66, 70]], expected: 127 },
        { args: [[8, 10, 2]], expected: 10 },
      ],
      approach:
        "Numbers are 31-bit strings, so 'maximize XOR' becomes a trie problem: insert every number into a binary trie and, for each, walk it preferring the OPPOSITE bit at every level — greedy works because a higher bit outweighs all lower bits combined. The solution shown compresses that into prefix sets: bit by bit (high to low), ask 'can the answer have this bit set?' by testing whether two current prefixes XOR to the candidate (a ^ b = c ⟺ a ^ c = b). Same greedy, same O(31n); the explicit trie just materializes what the set version implies.",
      docAnchor: "tries",
    },
    {
      slug: "word-search-ii",
      title: "Word Search II",
      difficulty: "Hard",
      category: "tries",
      blurb: "Find every dictionary word hidden in a letter grid.",
      statement: [
        "Given an `m × n` board of letters and a list `words`, return all words that can be formed by a path of adjacent cells (up/down/left/right), using each cell at most once per word.",
      ],
      examples: [
        {
          input: "board = [[\"o\",\"a\",\"a\",\"n\"],[\"e\",\"t\",\"a\",\"e\"],[\"i\",\"h\",\"k\",\"r\"],[\"i\",\"f\",\"l\",\"v\"]], words = [\"oath\",\"pea\",\"eat\",\"rain\"]",
          output: "[\"eat\",\"oath\"]",
        },
        { input: "board = [[\"a\",\"b\"],[\"c\",\"d\"]], words = [\"abcb\"]", output: "[]" },
      ],
      constraints: ["1 <= rows, cols <= 12", "1 <= words.length <= 3 * 10^4"],
      fnName: "findWords",
      starter: "function findWords(board, words) {\n  \n}",
      solution:
        "function findWords(board, words) {\n  const root = {};\n  for (const w of words) {\n    let node = root;\n    for (const ch of w) node = node[ch] || (node[ch] = {});\n    node.word = w;\n  }\n  const R = board.length, C = board[0].length;\n  const res = [];\n  function walk(r, c, node) {\n    if (r < 0 || c < 0 || r >= R || c >= C) return;\n    const ch = board[r][c];\n    const next = node[ch];\n    if (!next) return;\n    if (next.word) {\n      res.push(next.word);\n      next.word = null; // report each word once\n    }\n    board[r][c] = \"#\";\n    walk(r + 1, c, next);\n    walk(r - 1, c, next);\n    walk(r, c + 1, next);\n    walk(r, c - 1, next);\n    board[r][c] = ch;\n  }\n  for (let r = 0; r < R; r++) {\n    for (let c = 0; c < C; c++) walk(r, c, root);\n  }\n  return res;\n}",
      tests: [
        {
          args: [
            [["o", "a", "a", "n"], ["e", "t", "a", "e"], ["i", "h", "k", "r"], ["i", "f", "l", "v"]],
            ["oath", "pea", "eat", "rain"],
          ],
          expected: ["eat", "oath"],
          unordered: true,
        },
        { args: [[["a", "b"], ["c", "d"]], ["abcb"]], expected: [] },
        { args: [[["a", "b"], ["c", "d"]], ["ab", "cb", "ad", "abd"]], expected: ["ab", "abd"], unordered: true },
      ],
      approach:
        "The category capstone: searching each word separately re-walks the same grid paths thousands of times, but inserting ALL words into one trie lets a single DFS check every word simultaneously — the trie node travels WITH the recursion, and a missing child prunes the entire branch (no word continues this way, stop). Storing the full word on its end node avoids rebuilding strings, and nulling it after reporting prevents duplicates. Temporarily overwriting the cell with '#' is the visited-mark-and-restore backtracking idiom. Trie + backtracking DFS: two patterns fused into one of the most-asked hard questions.",
      docAnchor: "tries",
    },
    {
      slug: "short-encoding-of-words",
      title: "Short Encoding of Words",
      difficulty: "Medium",
      category: "tries",
      blurb: "Pack words into one string using shared suffixes.",
      statement: [
        'Encode a list of `words` into a reference string where each word appears followed by `"#"`, and a word may reuse another word\'s **suffix** (e.g. `"me"` is contained in `"time#"`). Return the length of the shortest possible encoding.',
        "Canonical must-do (AM-600 Trie family).",
      ],
      examples: [
        { input: 'words = ["time","me","bell"]', output: "10", explanation: '"time#bell#" — "me" reuses "time#".' },
        { input: 'words = ["t"]', output: "2" },
      ],
      constraints: ["1 <= words.length <= 2000", "1 <= words[i].length <= 7"],
      fnName: "minimumLengthEncoding",
      starter: `function minimumLengthEncoding(words) {\n  \n}`,
      solution: `function minimumLengthEncoding(words) {\n  const set = new Set(words);\n  for (const w of words) {\n    for (let i = 1; i < w.length; i++) set.delete(w.slice(i));\n  }\n  let total = 0;\n  for (const w of set) total += w.length + 1;\n  return total;\n}`,
      tests: [
        { args: [["time", "me", "bell"]], expected: 10 },
        { args: [["t"]], expected: 2 },
        { args: [["me", "time"]], expected: 5 },
        { args: [["a", "aa", "aaa"]], expected: 4 },
      ],
      approach:
        "A word is free if it's a **suffix** of another word. So drop every proper suffix of every word from the set; whatever survives must be written out in full (`length + 1` for its `#`). The trie framing is the same idea reversed: insert all words **backwards** into a trie, and only the leaf nodes need encoding — shared suffixes become shared root paths. O(total characters).",
      docAnchor: "tries",
    },
    {
      slug: "camelcase-matching",
      title: "Camelcase Matching",
      difficulty: "Medium",
      category: "tries",
      blurb: "Does each query match the pattern by inserting lowercase?",
      statement: [
        "A query matches `pattern` if you can insert **lowercase** letters into the pattern to make it equal the query (uppercase letters must line up exactly, in order). Return an array of booleans, one per query.",
        "Canonical must-do (AM-600 Trie / Two Pointers family).",
      ],
      examples: [
        { input: 'queries = ["FooBar","FooBarTest","FootBall","FrameBuffer","ForceFeedBack"], pattern = "FB"', output: "[true,false,true,true,false]" },
      ],
      constraints: ["1 <= queries.length <= 100", "1 <= pattern.length <= 100"],
      fnName: "camelMatch",
      starter: `function camelMatch(queries, pattern) {\n  \n}`,
      solution: `function camelMatch(queries, pattern) {\n  function match(q) {\n    let j = 0;\n    for (const c of q) {\n      if (j < pattern.length && c === pattern[j]) j++;\n      else if (c >= "A" && c <= "Z") return false;\n    }\n    return j === pattern.length;\n  }\n  return queries.map(match);\n}`,
      tests: [
        { args: [["FooBar", "FooBarTest", "FootBall", "FrameBuffer", "ForceFeedBack"], "FB"], expected: [true, false, true, true, false] },
        { args: [["FooBar", "FooBarTest", "FootBall", "FrameBuffer", "ForceFeedBack"], "FoBa"], expected: [true, false, true, false, false] },
        { args: [["Foo"], "Foo"], expected: [true] },
      ],
      approach:
        "A subsequence check with **one extra rule**: walk the query, advancing the pattern pointer on a match. If a character doesn't match and it's **uppercase**, fail immediately — you're only allowed to insert *lowercase* letters, so an unmatched capital is fatal. Succeed only if the whole pattern was consumed. O(total query length).",
      docAnchor: "tries",
    },
  ],
};
