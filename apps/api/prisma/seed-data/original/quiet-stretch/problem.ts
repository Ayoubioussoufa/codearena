import { Difficulty } from '../../../../generated/prisma/client';
import { createRng } from '../rng';
import { OriginalProblem } from '../types';

const MAX_N = 200_000;
const MAX_VALUE = 1_000_000_000;

const line = (values: number[]) => values.join(' ');
const input = (k: number, values: number[]) =>
  `${values.length} ${k}\n${line(values)}\n`;

export const quietStretch: OriginalProblem = {
  id: 2001,
  slug: 'quiet-stretch',
  title: 'Quiet Stretch',
  difficulty: Difficulty.MEDIUM,
  description: [
    'A library records its noise level once a minute. The librarian wants the longest run of consecutive minutes whose total noise stays within a budget.',
    'Given the n readings and the budget k, print the length of the longest continuous stretch whose sum is at most k. Print 0 if no single minute fits.',
    'Input: the first line holds n and k. The second line holds n positive integers. Output: one integer.',
  ],
  constraints: [
    '1 ≤ n ≤ 200000',
    '1 ≤ reading ≤ 1000000000',
    '1 ≤ k ≤ 200000000000000',
  ],
  timeLimitMs: 1000,
  memoryLimitMb: 256,
  tags: ['Sliding Window', 'Array'],
  examples: [
    {
      input: '5 7\n2 1 3 4 1\n',
      output: '3\n',
      explanation: 'The first three minutes sum to 6. A fourth would make 10.',
    },
    {
      input: '3 2\n5 6 7\n',
      output: '0\n',
      explanation: 'Every single minute is already over the budget.',
    },
  ],
  generatedInputs: () => {
    const random = createRng(2001);
    const noise = (n: number, max: number) =>
      Array.from({ length: n }, () => random(1, max));
    const big = noise(MAX_N, MAX_VALUE);
    return [
      input(1, [1]), // smallest size, and it fits
      input(1, [2]), // smallest size, and it doesn't
      input(10, [5, 5, 5, 5, 5, 5]), // all equal
      input(21, [1, 2, 3, 4, 5, 6]), // the whole array fits exactly
      input(50, noise(100, 10)),
      input(5_000, noise(2_000, 10)),
      input(5_000_000, noise(5_000, 2_000)),
      // The O(n²) killer: half of everything fits, so a brute force keeps
      // extending every start for about 100000 steps.
      input(big.reduce((sum, value) => sum + value, 0) / 2, big),
    ];
  },
};
