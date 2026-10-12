"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/features/auth/hooks/use-session";
import { getMyProfile } from "../api";
import type { Profile } from "../types";

type Loaded = { status: "ready"; profile: Profile } | { status: "error" };
export type MyProfileState = Loaded | { status: "loading" } | { status: "signed-out" };

/** Loads the signed-in user's profile once the session is known. `replace` swaps in the copy a save returned. */
export function useMyProfile() {
  const session = useSession();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (session.status !== "authenticated") return;
    let current = true;
    getMyProfile().then(
      (profile) => current && setLoaded({ status: "ready", profile }),
      () => current && setLoaded({ status: "error" }),
    );
    return () => {
      current = false;
    };
  }, [session.status, attempt]);

  const state: MyProfileState =
    session.status === "anonymous" ? { status: "signed-out" } : (loaded ?? { status: "loading" });

  const reload = useCallback(() => {
    setLoaded(null);
    setAttempt((n) => n + 1);
  }, []);
  const replace = useCallback((profile: Profile) => setLoaded({ status: "ready", profile }), []);

  return { state, reload, replace };
}
