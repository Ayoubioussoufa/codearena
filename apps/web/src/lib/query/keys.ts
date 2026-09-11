/**
 * Query keys are the whole API of a cache.
 *
 * Get the shape right and invalidation is one line; get it wrong and you fight
 * it all day. The rule: keys go from GENERAL to SPECIFIC, so a prefix
 * invalidates everything beneath it — invalidating ['problems'] also clears
 * ['problems','detail','two-sum'].
 */
export const queryKeys = {
  problems: ['problems'] as const,
  problemsList: () => [...queryKeys.problems, 'list'] as const,
  problem: (slug: string) => [...queryKeys.problems, 'detail', slug] as const,
  me: ['me'] as const,
};
