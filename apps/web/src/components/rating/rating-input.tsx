"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { STAR_VALUES, type RatingsController, type StarValue } from "@/features/ratings/types";
import { StarIcon } from "./star-icon";
import { RATING_WORDS, starsText, statusText } from "./words";

type Props = {
  ratings: RatingsController;
  /**
   * stacked: legend above the stars and a help line below. inline: legend to the left (the Ratings card).
   * prompt: legend visually hidden, `trailing` (Not now) at the end of the row.
   */
  layout: "stacked" | "inline" | "prompt";
  legend?: string;
  size?: 30 | 32;
  /** The "Saving…" / "Saved…" line with Remove rating, Undo and Try again. Only one instance per page sets it. */
  withStatus?: boolean;
  /** Where "Log in to rate" goes (the login page, coming back to this post's ratings). */
  loginHref: string;
  trailing?: ReactNode;
};

/**
 * "Your rating": five real radios in a fieldset (arrow keys move between them, natively), each a 44px target with its
 * word read out. Hovering previews a value; leaving goes back to the saved one. Signed out, on your own site and
 * before the first summary arrives, it shows faded stars and no radios.
 */
export function RatingInput({ ratings, layout, legend = "Your rating", size = 32, withStatus = false, loginHref, trailing }: Props) {
  const name = useId();
  const [hover, setHover] = useState<StarValue | null>(null);
  const { summary, loading, saving, status, canUndo } = ratings;
  const mine = summary.myRating;
  const live = !loading && summary.canRate;
  const shown = live ? (hover ?? mine) : null;

  let stars: ReactNode;
  let beside: ReactNode = null;
  if (live) {
    stars = (
      <div className={saving ? "rt-group saving" : "rt-group"} onMouseLeave={() => setHover(null)}>
        {STAR_VALUES.map((n) => (
          <label key={n} className="rt-target" title={RATING_WORDS[n]} onMouseEnter={() => setHover(n)}>
            <input type="radio" name={name} value={n} checked={mine === n} onChange={() => ratings.rate(n)} />
            <StarIcon size={size} fill={shown !== null && n <= shown ? 100 : 0} />
            <span className="sr">{`${starsText(n)}, ${RATING_WORDS[n]}`}</span>
          </label>
        ))}
      </div>
    );
    beside = <span className={shown ? "rt-word on" : "rt-word"} aria-hidden="true">{shown ? RATING_WORDS[shown] : "Not rated yet"}</span>;
  } else {
    stars = (
      <span className="rt-group off" aria-hidden="true">
        {STAR_VALUES.map((n) => <span key={n} className="rt-target"><StarIcon size={size} /></span>)}
      </span>
    );
    if (!loading && summary.reason === "signed_out") beside = <Link className="rt-link" href={loginHref}>Log in to rate</Link>;
    if (!loading && summary.reason === "own_post") beside = <span className="rt-note">You can&apos;t rate your own site.</span>;
  }

  return (
    <>
      <fieldset className={`rt-fs rt-${layout}`}>
        <legend className={layout === "prompt" ? "sr" : undefined}>{legend}</legend>
        <div className="rt-inl">
          {stars}
          {beside}
        </div>
        {trailing}
      </fieldset>
      {layout === "stacked" && live && <p className="rt-help">Tap a star to rate. You can change it any time.</p>}
      {withStatus && (
        <div className="rt-statusrow">
          <p className={status.kind === "error" ? "rt-status err" : "rt-status"} role="status" aria-live="polite">{statusText(status)}</p>
          {status.kind === "error" && <button type="button" className="rt-lb" onClick={ratings.retry}>Try again</button>}
          {status.kind !== "error" && status.kind !== "saving" && canUndo && <button type="button" className="rt-lb" onClick={ratings.undo}>Undo</button>}
          {live && mine !== null && status.kind !== "error" && status.kind !== "saving" && (
            <button type="button" className="rt-lb" onClick={ratings.remove}>Remove rating</button>
          )}
        </div>
      )}
    </>
  );
}
