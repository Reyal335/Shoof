"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { RatingsController } from "./types";
import { useRatings, useVisitClock, type RatingSeed } from "./use-ratings";

type RatingsContextValue = RatingsController & {
  /** Call when the viewer opens the live site, so the rate prompt can ask when they come back. */
  markVisited: () => void;
  visitedAt: () => number | null;
};

const RatingsContext = createContext<RatingsContextValue | null>(null);

/**
 * One rating state per post page. The meta line, the facts list, the Ratings card and the rate prompt all read it,
 * so their numbers always move together.
 */
export function RatingsProvider({ postId, seed, children }: { postId: string; seed?: RatingSeed; children: ReactNode }) {
  const ratings = useRatings(postId, seed);
  const { markVisited, getVisitedAt } = useVisitClock();
  return <RatingsContext.Provider value={{ ...ratings, markVisited, visitedAt: getVisitedAt }}>{children}</RatingsContext.Provider>;
}

export function useRatingsContext(): RatingsContextValue {
  const value = useContext(RatingsContext);
  if (!value) throw new Error("useRatingsContext must be inside <RatingsProvider>");
  return value;
}
