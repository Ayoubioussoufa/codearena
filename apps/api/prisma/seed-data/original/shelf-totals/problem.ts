import { Difficulty } from '../../../../generated/prisma/client';
import { createRng } from '../rng';
import { OriginalProblem } from '../types';

const MAX_N = 200_000;
const MAX_VALUE = 1_000_000_000;

type Query = [left: number, right: number];

const input = (values: number[], queries: Query[]) =>
  `${values.length} ${queries.length}\n${values.join(' ')}\n${queries
    .map(([left, right]) => `${left} ${right}`)
    .join('\n')}\n`;

export const shelfTotals: OriginalProblem = {
  id: 2002,
  slug: 'shelf-totals',
  title: 'Shelf Totals',
  difficulty: Difficulty.EASY,
  description: [
    'A warehouse has n shelves in a row, numbered from 1, and each shelf holds some boxes. Staff keep asking how many boxes sit between two shelves.',
    'For each query l r, print the total number of boxes on shelves l to r, both included.',
    'Input: the first line holds n and q. The second line holds n integers. Then come q lines, each with l and r. Output: one integer per query, one per line.',
  ],
  constraints: [
    '1 ≤ n, q ≤ 200000',
    '1 ≤ boxes on a shelf ≤ 1000000000',
    '1 ≤ l ≤ r ≤ n',
  ],
  timeLimitMs: 1000,
  memoryLimitMb: 256,
  tags: ['Prefix Sum', 'Array'],
  examples: [
    {
      input: '5 3\n4 2 7 1 3\n1 3\n2 2\n1 5\n',
      output: '13\n2\n17\n',
      explanation: '4 + 2 + 7 = 13, then shelf 2 alone, then every shelf.',
    },
    {
      input: '1 1\n9\n1 1\n',
      output: '9\n',
      explanation: 'One shelf and one query.',
    },
  ],
  generatedInputs: () => {
    const random = createRng(2002);
    const boxes = (n: number, max: number) =>
      Array.from({ length: n }, () => random(1, max));
    const randomQueries = (n: number, q: number): Query[] =>
      Array.from({ length: q }, () => {
        const left = random(1, n);
        return [left, random(left, n)];
      });
    return [
      input([MAX_VALUE], [[1, 1]]), // smallest size, largest value
      input(
        [3, 3, 3, 3],
        [
          [1, 4],
          [2, 3],
          [4, 4],
        ],
      ), // all equal
      input(
        [1, 2, 3],
        [
          [1, 1],
          [2, 2],
          [3, 3],
        ],
      ), // single shelves
      input(boxes(50, 100), randomQueries(50, 50)),
      input(boxes(1_000, 1_000), randomQueries(1_000, 1_000)),
      input(boxes(5_000, MAX_VALUE), randomQueries(5_000, 5_000)),
      input(boxes(3_000, MAX_VALUE), randomQueries(3_000, 10)),
      // The O(n²) killer: every query covers the whole row, so adding up each
      // query's shelves takes 200000 × 200000 steps. The prefix sums still
      // fit in a double: at most 2 × 10¹⁴, below 2⁵³.
      input(
        boxes(MAX_N, MAX_VALUE),
        Array.from({ length: MAX_N }, (): Query => [1, MAX_N]),
      ),
    ];
  },
};
