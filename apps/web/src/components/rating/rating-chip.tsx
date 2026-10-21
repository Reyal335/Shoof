import { StarIcon } from "./star-icon";
import { ratingLabel } from "./star-rating";

/** A site card's rating: "★ 4.6 (128)", or a "New" pill when nobody has rated it yet. */
export function RatingChip({ value, count }: { value: number; count: number }) {
  if (!count) {
    return <span className="rt-chip rt-chip-new" role="img" aria-label="New, no ratings yet">New</span>;
  }
  return (
    <span className="rt-chip" role="img" aria-label={ratingLabel(value, count)}>
      <StarIcon size={14} fill={100} />
      <b>{(Math.round(value * 10) / 10).toFixed(1)}</b>
      <span className="rt-chip-n">({count})</span>
    </span>
  );
}
