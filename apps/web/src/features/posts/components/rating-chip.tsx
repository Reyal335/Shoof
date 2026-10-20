const STAR = "M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z";

/** "★ 4.5 (12)" on a card, or "No ratings yet". */
export function RatingChip({ rating, count }: { rating: number; count: number }) {
  if (!count) {
    return <span className="rating-chip"><span className="none">No ratings yet</span></span>;
  }
  return (
    <span className="rating-chip" aria-label={`Rated ${rating.toFixed(1)} out of 5 from ${count} ${count === 1 ? "rating" : "ratings"}`}>
      <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path d={STAR} /></svg>
      <span aria-hidden="true">{rating.toFixed(1)} ({count})</span>
    </span>
  );
}
