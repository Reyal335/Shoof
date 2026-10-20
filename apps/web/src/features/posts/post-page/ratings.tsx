"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Stars } from "@/components/stars";
import { useRating } from "../hooks/use-rating";
import { postHref } from "../paths";
import type { PostDetail, StarValue } from "../types";

const STAR = "M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z";
const VALUES: StarValue[] = [1, 2, 3, 4, 5];

type OptionProps = { value: StarValue; mine: StarValue | 0; disabled: boolean; onRate: (value: StarValue) => void };

function RateOption({ value, mine, disabled, onRate }: OptionProps) {
  return (
    <>
      <input type="radio" name="rate" id={`rate-${value}`} value={value} checked={mine === value} disabled={disabled} onChange={() => onRate(value)} />
      <label htmlFor={`rate-${value}`} className={value <= mine ? "on" : undefined}><span className="sr">{value === 1 ? "1 star" : `${value} stars`}</span><svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path d={STAR} /></svg></label>
    </>
  );
}

/** Average, distribution bars and "Your rating" (five visually hidden radios with 44px star labels). */
export function Ratings({ post }: { post: PostDetail }) {
  const { state, rate, clear, retry, isSaving, error } = useRating(post);
  const dist = post.ratingDistribution;
  const count = post.ratingCount;
  const width = (star: StarValue) => ({ width: `${count ? ((dist[star] / count) * 100).toFixed(1) : 0}%` });
  const mine = state.status === "ready" ? state.value ?? 0 : 0;

  let message: ReactNode;
  switch (state.status) {
    case "loading":
      message = "Loading your rating…";
      break;
    case "signed-out":
      message = <><Link href={`/login?next=${encodeURIComponent(`${postHref(post)}#h-ratings`)}`}>Log in</Link> to rate this site.</>;
      break;
    case "own":
      message = "This is your site, so you can't rate it. Others' ratings show here.";
      break;
    case "error":
      message = <>We couldn&apos;t load your rating. <button type="button" className="linkbtn" onClick={retry}>Try again</button></>;
      break;
    case "ready":
      message = error ?? (mine ? <>You rated this {mine} out of 5. Thanks! <button type="button" className="linkbtn" onClick={clear} disabled={isSaving}>Remove my rating</button></> : "Pick a number of stars.");
      break;
  }

  return (
    <section className="card sec" aria-labelledby="h-ratings">
      <h2 id="h-ratings">Ratings</h2>
      <div className="rgrid">
        <div className="avg"><b>{post.rating.toFixed(1)}</b><span><Stars avg={post.rating} /></span><span><span>{count}</span> {count === 1 ? "rating" : "ratings"}</span></div>
        <ol className="bars" aria-label="Ratings by stars">
          {[...VALUES].reverse().map((star) => (
            <li key={star}><span>{star === 1 ? "1 star" : `${star} stars`}</span><span className="bar"><i style={width(star)} /></span><span className="c">{dist[star]}</span></li>
          ))}
        </ol>
        <fieldset className="yours" aria-busy={isSaving}>
          <legend>Your rating</legend>
          <div className="rate">
            {VALUES.map((value) => <RateOption key={value} value={value} mine={mine} disabled={state.status !== "ready" || isSaving} onRate={rate} />)}
          </div>
          <span id="rate-msg" role="status" aria-live="polite">{message}</span>
        </fieldset>
      </div>
    </section>
  );
}
