/**
 * The access token lives HERE — in a module-level variable — and nowhere else.
 *
 * Not localStorage: anything JavaScript can read is stolen the moment the app
 * has any XSS. Not a cookie: cookies are attached automatically, which would
 * make it CSRF-able for no gain.
 *
 * Memory dies on tab close and does not survive a page refresh. That is fine,
 * and deliberate — the httpOnly refresh cookie is what restores the session.
 * See docs/adr/004-token-storage-cookie-vs-memory.md
 */
let accessToken: string | null = null;

export const getAccessToken = (): string | null => accessToken;
export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};
