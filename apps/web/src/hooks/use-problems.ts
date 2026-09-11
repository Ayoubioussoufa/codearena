'use client';
/**
 * Replaces the useState + useEffect + loading-flag dance.
 *
 * That pattern re-implements a cache, badly, in every component: two
 * components asking for the same data fire two requests, and neither knows
 * the other exists. Server state is not component state — it lives on the
 * server, it can be stale, and it should be shared.
 */
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/http';
import { queryKeys } from '@/lib/query/keys';
import type { Problem } from '@/lib/types';

type ProblemsPage = { items: Problem[]; nextCursor: number | null };

/** Walks every cursor page. The API caps `limit` at 100. */
async function fetchAllProblems(): Promise<Problem[]> {
  const all: Problem[] = [];
  let cursor: number | null = null;

  do {
    // The annotations are REQUIRED, not noise: cursor -> query -> page ->
    // nextCursor -> cursor is a circular inference, and TS gives up with
    // TS7022. Naming one type in the loop breaks the cycle.
    const query: string = cursor === null ? '' : `&cursor=${cursor}`;
    const page: ProblemsPage = await api<ProblemsPage>(
      `/problems?limit=100${query}`,
    );
    all.push(...page.items);
    cursor = page.nextCursor;
  } while (cursor !== null);

  return all;
}

export function useProblems() {
  return useQuery({
    queryKey: queryKeys.problemsList(),
    queryFn: fetchAllProblems,
  });
}

export function useProblem(slug: string) {
  return useQuery({
    queryKey: queryKeys.problem(slug),
    queryFn: () => api<Problem>(`/problems/${slug}`),
    enabled: slug.length > 0,
  });
}
