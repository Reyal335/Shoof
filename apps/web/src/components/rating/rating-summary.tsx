"use client";

import type { RatingsController, StarValue } from "@/features/ratings/types";
import { RatingInput } from "./rating-input";
import { StarIcon } from "./star-icon";
import { StarRating } from "./star-rating";
import { starsText } from "./words";

const BARS: StarValue[] = [5, 4, 3, 2, 1];
const EMPTY = [0, 1, 2, 3, 4];

/**
 * The post page's Ratings card: the average, its stars and count beside the 5-to-1 bars, then "Your rating" with the
 * page's one status line. With no ratings it shows the empty state instead. Keeps id="h-ratings" for #h-ratings links.
 */
export function RatingSummary({ ratings, loginHref }: { ratings: RatingsController; loginHref: string }) {
  const { average, count, distribution } = ratings.summary;

  return (
    <section className="card sec rt-card" aria-labelledby="h-ratings">
      <h2 id="h-ratings">Ratings</h2>
      {count > 0 ? (
        <div className="rt-grid">
          <div className="rt-avg">
            <span className="rt-avg-n">{(Math.round(average * 10) / 10).toFixed(1)}</span>
            <StarRating value={average} count={count} size={20} />
            <span className="rt-muted">{count === 1 ? "1 rating" : `${count} ratings`}</span>
          </div>
          <ol className="rt-bars" aria-label="Ratings by stars">
            {BARS.map((n) => (
              <li key={n}>
                <span className="rt-bk"><span aria-hidden="true">{n}</span><StarIcon size={14} fill={100} /><span className="sr">{starsText(n)}</span></span>
                <span className="rt-track" aria-hidden="true"><span style={{ width: `${((distribution[n] / count) * 100).toFixed(1)}%` }} /></span>
                <span className="rt-bc">{distribution[n]}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="rt-empty">
          <span className="rt-row" aria-hidden="true">{EMPTY.map((i) => <StarIcon key={i} size={28} />)}</span>
          <div>
            <p className="rt-empty-title">{ratings.loading ? "Loading ratings…" : "No ratings yet"}</p>
            {!ratings.loading && <p className="rt-muted">Try the site, then be the first to rate it.</p>}
          </div>
        </div>
      )}
      <div className="rt-yours">
        <RatingInput ratings={ratings} layout="inline" withStatus loginHref={loginHref} />
      </div>
    </section>
  );
}
