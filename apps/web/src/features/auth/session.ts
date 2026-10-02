import type { TokenPair } from "./api";

const KEY = "shoof.session";

type StoredSession = {
  accessToken: string;
  refreshToken: string;
  /** Epoch milliseconds. */
  expiresAt: number;
};

/**
 * Keeps the session in localStorage when the user asks to stay logged in,
 * otherwise in sessionStorage so it ends with the tab.
 *
 * Interim: web storage is readable by any script on the page. Move the
 * refresh token to an httpOnly cookie before launch.
 */
export function saveSession(tokens: TokenPair, { remember }: { remember: boolean }) {
  const session: StoredSession = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: Date.now() + tokens.expiresIn * 1000,
  };
  const value = JSON.stringify(session);

  try {
    (remember ? sessionStorage : localStorage).removeItem(KEY);
    (remember ? localStorage : sessionStorage).setItem(KEY, value);
  } catch {
    // Storage blocked (private mode, disabled site data): nothing persists, so the next page load is signed out.
  }
}
