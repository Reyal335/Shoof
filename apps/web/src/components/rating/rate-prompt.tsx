"use client";

import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";
import type { RatingsController } from "@/features/ratings/types";
import { RatingInput } from "./rating-input";
import { RATING_WORDS } from "./words";

const STORAGE_PREFIX = "shoof-rate-prompt:";
// How long someone must have been away on the live site before coming back counts as "they tried it"
const AWAY_MS = 3000;

function isDismissed(postId: string) {
  try {
    return localStorage.getItem(STORAGE_PREFIX + postId) === "dismissed";
  } catch {
    return false;
  }
}

function storeDismissed(postId: string) {
  try {
    localStorage.setItem(STORAGE_PREFIX + postId, "dismissed");
  } catch {
    // Storage blocked: it just won't remember past this page view
  }
}

const CLOSE_ICON = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>;

type Props = {
  ratings: RatingsController;
  /** The live site's hostname: "How was {host}?" */
  host: string;
  /** The 44px site thumbnail. */
  thumb: ReactNode;
  /** When the viewer last opened the live site from this page, or null. */
  visitedAt: () => number | null;
  loginHref: string;
};

/**
 * "How was yourgame.example.com?": asks for a rating once, after someone opens the live site and comes back to this
 * tab at least 3 seconds later. Never on page load, never if they've rated or dismissed it before, at most once per
 * page view. It doesn't take focus; Escape (with focus inside), Close and Not now all dismiss it for good.
 */
export function RatePrompt({ ratings, host, thumb, visitedAt, loginHref }: Props) {
  // awaiting: a star was picked here and the thanks waits for the save (arrow keys may move through a few values)
  const [phase, setPhase] = useState<"hidden" | "ask" | "awaiting" | "done">("hidden");
  const shown = useRef(false);
  const focusInside = useRef(false);
  const change = useRef<HTMLButtonElement>(null);
  const latest = useRef(ratings);
  useEffect(() => {
    latest.current = ratings;
  });
  const { postId } = ratings;
  const rated = ratings.summary.myRating;

  // The save landed: thank them (state adjusted while rendering, as React suggests for state derived from props)
  if (phase === "awaiting" && ratings.status.kind === "saved" && rated !== null) {
    setPhase("done");
  }

  // If focus was on the stars, put it on Change so it isn't lost when they go
  useEffect(() => {
    if (phase === "done" && focusInside.current) change.current?.focus();
  }, [phase]);

  useEffect(() => {
    function check() {
      if (shown.current || document.visibilityState !== "visible") return;
      const at = visitedAt();
      const { loading, summary } = latest.current;
      if (at === null || Date.now() - at < AWAY_MS) return;
      if (loading || !summary.canRate || summary.myRating !== null || isDismissed(postId)) return;
      shown.current = true;
      setPhase("ask");
    }
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    return () => {
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, [postId, visitedAt]);

  function dismiss() {
    storeDismissed(postId);
    setPhase("hidden");
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") dismiss();
  }

  const focusEvents = {
    onKeyDown,
    onFocus: () => (focusInside.current = true),
    onBlur: (event: FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) focusInside.current = false;
    },
  };

  if (phase === "hidden") return null;

  // A failed save takes the rating back (myRating null), which puts the stars back too
  if (phase === "done" && rated !== null) {
    return (
      <div className="rt-toast rt-toast-done" role="region" aria-label="Rating saved" {...focusEvents}>
        <span className="rt-okdot" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#101b33" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg></span>
        <p className="rt-done-text">{`Thanks! You rated it ${rated} · ${RATING_WORDS[rated]}.`}</p>
        <button type="button" className="rt-lb" ref={change} onClick={() => setPhase("ask")}>Change</button>
        <button type="button" className="rt-x" aria-label="Close" onClick={dismiss}>{CLOSE_ICON}</button>
      </div>
    );
  }

  return (
    <div className="rt-toast" role="region" aria-label="Rate this site" {...focusEvents}>
      <div className="rt-trow">
        <span className="rt-thumb" aria-hidden="true">{thumb}</span>
        <div className="rt-ttext">
          <p className="rt-tt">How was {host}?</p>
          <p className="rt-muted">You just tried it. A rating helps other people find good sites.</p>
        </div>
        <button type="button" className="rt-x" aria-label="Close" onClick={dismiss}>{CLOSE_ICON}</button>
      </div>
      <PromptStars ratings={ratings} host={host} loginHref={loginHref} onRated={() => setPhase("awaiting")} onNotNow={dismiss} />
    </div>
  );
}

function PromptStars({ ratings, host, loginHref, onRated, onNotNow }: { ratings: RatingsController; host: string; loginHref: string; onRated: () => void; onNotNow: () => void }) {
  // Picking a star saves through the page's one rating state, then shows the thanks
  const controller: RatingsController = {
    ...ratings,
    rate: (value) => {
      ratings.rate(value);
      onRated();
    },
  };
  return (
    <RatingInput
      ratings={controller}
      layout="prompt"
      size={30}
      legend={`Your rating for ${host}`}
      loginHref={loginHref}
      trailing={<button type="button" className="rt-ghost" onClick={onNotNow}>Not now</button>}
    />
  );
}
