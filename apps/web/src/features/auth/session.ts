import { ApiError, request } from "@/lib/api-client";
import type { AccessTokenResponse } from "./api";

export type SessionStatus = "unknown" | "authenticated" | "anonymous";

// Refresh slightly early so a request never leaves with a token about to expire
const EXPIRY_MARGIN_MS = 30_000;
const AUTH_CHANNEL = "shoof:auth";

let accessToken: string | null = null;
let accessTokenExpiresAt = 0;
let status: SessionStatus = "unknown";
let refreshing: Promise<string | null> | null = null;
let channel: BroadcastChannel | null = null;
const listeners = new Set<() => void>();

function setStatus(next: SessionStatus) {
  if (next === status) return;
  status = next;
  listeners.forEach((notify) => notify());
}

export function setAccessToken(tokens: AccessTokenResponse) {
  accessToken = tokens.accessToken;
  accessTokenExpiresAt = Date.now() + tokens.expiresIn * 1000;
  setStatus("authenticated");
}

export function clearAccessToken() {
  accessToken = null;
  accessTokenExpiresAt = 0;
  setStatus("anonymous");
}

export function getAccessToken() {
  if (!accessToken || Date.now() >= accessTokenExpiresAt - EXPIRY_MARGIN_MS) return null;
  return accessToken;
}

/**
 * Trades the refresh cookie for a new access token. Resolves to null when there is no session,
 * and rejects only when the API can't be reached. Callers in this tab share one request. The lock
 * makes other tabs wait their turn, so they send the rotated cookie instead of the one just used.
 */
export function refreshSession(): Promise<string | null> {
  refreshing ??= navigator.locks
    .request("shoof:refresh", async () =>
      request<AccessTokenResponse>("/auth/refresh", { method: "POST" }),
    )
    .then((tokens) => tokens)
    .then((tokens) => {
      setAccessToken(tokens);
      return tokens.accessToken;
    })
    .catch((err) => {
      if (err instanceof ApiError && err.status === 401) {
        clearAccessToken();
        return null;
      }
      throw err;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

/** Runs once per page load: a reload starts with no token in memory. */
export function restoreSession() {
  if (status !== "unknown") return;
  channel ??= new BroadcastChannel(AUTH_CHANNEL);
  channel.onmessage = () => clearAccessToken(); // another tab signed out
  refreshSession().catch(() => setStatus("anonymous"));
}

export function announceSignOut() {
  new BroadcastChannel(AUTH_CHANNEL).postMessage("signed-out");
}

export const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const getStatus = () => status;
