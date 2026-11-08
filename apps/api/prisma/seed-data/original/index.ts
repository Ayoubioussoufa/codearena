import { pairBudget } from './pair-budget/problem';
import { quietStretch } from './quiet-stretch/problem';
import { shelfTotals } from './shelf-totals/problem';
import { OriginalProblem } from './types';

export const originalProblems: OriginalProblem[] = [
  quietStretch,
  shelfTotals,
  pairBudget,
];
