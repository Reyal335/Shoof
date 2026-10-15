"use client";

import { useCallback, useEffect, useState } from "react";
import { getSkills } from "../api";
import type { CatalogSkill } from "../types";

export type SkillsState =
  | { status: "loading" }
  | { status: "ready"; skills: CatalogSkill[] }
  | { status: "error" };

// The catalog only changes when it's re-seeded, so one fetch serves every picker for the rest of the visit.
// A failed fetch is forgotten so the next attempt tries again.
let catalog: Promise<CatalogSkill[]> | null = null;

function loadCatalog() {
  catalog ??= getSkills().catch((error: unknown) => {
    catalog = null;
    throw error;
  });
  return catalog;
}

/** The skills catalog for pickers. `retry` refetches after an error. */
export function useSkills() {
  const [state, setState] = useState<SkillsState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    loadCatalog().then(
      (skills) => current && setState({ status: "ready", skills }),
      () => current && setState({ status: "error" }),
    );
    return () => {
      current = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  return { state, retry };
}
