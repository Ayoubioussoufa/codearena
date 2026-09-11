'use client';
/**
 * Auth mutations against the real API.
 *
 * These are MUTATIONS, not queries: they change server state, they are never
 * cached, and they must be triggered explicitly rather than on render.
 *
 * The refresh token never appears here — it arrives as an httpOnly cookie the
 * browser stores and sends on its own. Only the access token is ours to hold,
 * and it goes into memory.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setAccessToken } from '@/lib/access-token';
import { api } from '@/lib/http';
import { queryKeys } from '@/lib/query/keys';

type TokenResponse = { accessToken: string };
type Me = { id: string; role: 'USER' | 'ADMIN' };

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      api<TokenResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken);
      // Anything cached for a logged-out viewer is now wrong.
      void queryClient.invalidateQueries();
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: { email: string; username: string; password: string }) =>
      api<{ id: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api<void>('/auth/logout', { method: 'POST' }),
    // onSettled, not onSuccess: logout is idempotent server-side, so the local
    // session must end even if the request failed. Never leave a user holding
    // a token because the network blipped.
    onSettled: () => {
      setAccessToken(null);
      queryClient.clear();
    },
  });
}

/**
 * Who am I? Also the session-restore path: on a page load the access token is
 * gone (it lived in memory), this 401s, and the interceptor in http.ts
 * silently refreshes using the cookie and retries.
 */
export function useMe() {
  return useMutation({
    mutationFn: () => api<Me>('/auth/me'),
  });
}

export { queryKeys };
