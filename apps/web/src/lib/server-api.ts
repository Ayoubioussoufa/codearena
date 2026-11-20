/**
 * Fetches for SERVER components.
 *
 * Deliberately separate from src/lib/http.ts: that one carries an access token
 * from a module-level variable and a refresh interceptor, both of which are
 * per-browser-tab concepts. On the server there is no tab and no cookie jar of
 * ours, so mixing them would leak one request's identity into another's.
 *
 * TanStack Query is not used here either — a server component renders once per
 * request, so there is nothing for a client cache to do.
 */
import type { Problem } from './types';
import { API_URL } from './api-url';

const BASE = API_URL;

/** One problem by slug, or null when it does not exist. */
export async function getProblem(slug: string): Promise<Problem | null> {
  const res = await fetch(`${BASE}/problems/${slug}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as Problem;
}
