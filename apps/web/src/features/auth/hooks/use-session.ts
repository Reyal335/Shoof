import { useEffect, useSyncExternalStore } from "react";
import { getStatus, restoreSession, subscribe, type SessionStatus } from "../session";

export function useSession() {
  // The server never has a session, so it renders "unknown" and the client takes over
  const status = useSyncExternalStore(subscribe, getStatus, (): SessionStatus => "unknown");
  useEffect(restoreSession, []);
  return { status, isAuthenticated: status === "authenticated" };
}