import type { RatingStatus, StarValue } from "@/features/ratings/types";

/** What each number of stars means, shown beside the stars and read out with each radio. */
export const RATING_WORDS: Record<StarValue, string> = {
  1: "Not for me",
  2: "Needs work",
  3: "Good",
  4: "Great",
  5: "Loved it",
};

export const starsText = (n: StarValue) => (n === 1 ? "1 star" : `${n} stars`);

/** The status line's sentence. Empty while idle. */
export function statusText(status: RatingStatus): string {
  switch (status.kind) {
    case "idle":
      return "";
    case "saving":
      return "Saving…";
    case "saved":
      return `Saved. You rated this ${status.value} out of 5.`;
    case "removed":
      return "Rating removed.";
    case "error":
      return "Couldn't save your rating. Check your connection and try again.";
  }
}
