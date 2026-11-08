import { Difficulty } from '../../../../generated/prisma/client';
import { createRng } from '../rng';
import { OriginalProblem } from '../types';

const MAX_N = 200_000;
const MAX_VALUE = 1_000_000_000;

const input = (budget: number, prices: number[]) =>
  `${prices.length} ${budget}\n${prices.join(' ')}\n`;

export const pairBudget: OriginalProblem = {
  id: 2003,
  slug: 'pair-budget',
  title: 'Pair Budget',
  difficulty: Difficulty.MEDIUM,
  description: [
    'A shop sells n items, and a customer wants to buy exactly two different items without going over their budget.',
    'Print how many pairs of items cost at most b in total. A pair is two different positions i < j, so two items with the same price still count as a pair.',
    'Input: the first line holds n and b. The second line holds n prices. Output: one integer.',
  ],
  constraints: [
    '1 ≤ n ≤ 200000',
    '1 ≤ price ≤ 1000000000',
    '1 ≤ b ≤ 2000000000',
  ],
  timeLimitMs: 1000,
  memoryLimitMb: 256,
  tags: ['Two Pointers', 'Sorting'],
  examples: [
    {
      input: '4 6\n1 5 3 2\n',
      output: '4\n',
      explanation: 'The pairs 1+5, 1+3, 1+2 and 3+2 fit. 5+3 and 5+2 do not.',
    },
    {
      input: '2 2\n3 3\n',
      output: '0\n',
      explanation: 'The only pair costs 6.',
    },
  ],
  generatedInputs: () => {
    const random = createRng(2003);
    const prices = (n: number, max: number) =>
      Array.from({ length: n }, () => random(1, max));
    return [
      input(5, [4]), // smallest size: one item makes no pair
      input(4, [2, 2, 2, 2]), // all equal, and every pair fits
      input(3, [2, 2, 2, 2]), // all equal, and no pair fits
      input(5, [1, 2, 3, 4]), // the budget is hit exactly
      input(150, prices(100, 100)),
      input(1_500, prices(2_000, 1_000)),
      input(MAX_VALUE, prices(5_000, MAX_VALUE)),
      // The O(n²) killer: every pair has to be looked at, about 2 × 10¹⁰ of
      // them. The answer is about the same, which still fits in a double.
      input(2 * MAX_VALUE, prices(MAX_N, MAX_VALUE)),
    ];
  },
};
