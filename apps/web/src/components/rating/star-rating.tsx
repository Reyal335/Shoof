import { StarIcon, type StarSize } from "./star-icon";

const STARS = [0, 1, 2, 3, 4];

/** "Rated 4.6 out of 5 from 128 ratings" ("1 rating" when there is one). */
export function ratingLabel(value: number, count: number) {
  return `Rated ${(Math.round(value * 10) / 10).toFixed(1)} out of 5 from ${count} ${count === 1 ? "rating" : "ratings"}`;
}

type Props = {
  /** The average, 0 to 5. Shown to one decimal, so 4.56 fills like 4.6. */
  value: number;
  count: number;
  size?: StarSize;
  /** Set when the number is visible beside the stars: the row is then hidden from screen readers. */
  decorative?: boolean;
};

/**
 * Read-only row of five stars for an average. Star i is filled (value − i) × 100 percent, clamped, so the last one is
 * filled part of the way. With no ratings it shows five empty stars and "No ratings yet", never "0.0".
 */
export function StarRating({ value, count, size = 18, decorative = false }: Props) {
  if (!count) {
    return (
      <span className="rt-row-none">
        <span className="rt-row" aria-hidden="true">{STARS.map((i) => <StarIcon key={i} size={size} />)}</span>
        <span className="rt-none-text">No ratings yet</span>
      </span>
    );
  }

  const rounded = Math.round(value * 10) / 10;
  const stars = STARS.map((i) => <StarIcon key={i} size={size} fill={(rounded - i) * 100} />);
  return decorative ? (
    <span className="rt-row" aria-hidden="true">{stars}</span>
  ) : (
    <span className="rt-row" role="img" aria-label={ratingLabel(value, count)}>{stars}</span>
  );
}
