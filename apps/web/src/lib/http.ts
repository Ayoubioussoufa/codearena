/**
 * One fetch wrapper for the whole app, with the refresh interceptor.
 *
 * THE BUG THIS EXISTS TO PREVENT: the access token expires after 15 minutes.
 * Without this, a user who leaves a tab open comes back to a 401 and appears
 * to have been "randomly logged out" — the single most common rookie auth bug.
 *
 * On a 401 we call /auth/refresh ONCE (the httpOnly cookie rides along
 * automatically), store the new access token, and retry the original request.
 * If the refresh also fails, the session is genuinely over.
 */
import { getAccessToken, setAccessToken } from './access-token';
import { API_URL } from './api-url';

const BASE = API_URL;

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/**
 * Concurrent 401s must not each fire their own refresh — rotation would see a
 * revoked token on the second one and burn the whole family as a replay.
 * Every caller awaits the SAME in-flight refresh.
 */
let refreshing: Promise<boolean> | null = null;

async function refreshOnce(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const res = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // sends the httpOnly refresh cookie
      });
      if (!res.ok) return false;
      const { accessToken } = (await res.json()) as { accessToken: string };
      setAccessToken(accessToken);
      return true;
    } catch {
      return false;
    } finally {
      // Cleared on the next tick so simultaneous callers all see this attempt.
      setTimeout(() => {
        refreshing = null;
      }, 0);
    }
  })();
  return refreshing;
}

async function send(path: string, init: RequestInit): Promise<Response> {
  const token = getAccessToken();
  return fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res = await send(path, init);

  // Never try to refresh the refresh call itself — that is an infinite loop.
  if (res.status === 401 && !path.startsWith('/auth/refresh')) {
    if (await refreshOnce()) {
      res = await send(path, init);
    } else {
      setAccessToken(null);
    }
  }

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => ({}));
    const message =
      typeof body === 'object' && body !== null && 'message' in body
        ? String((body as { message: unknown }).message)
        : `Request failed with ${res.status}`;
    throw new HttpError(res.status, message);
  }

  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}
