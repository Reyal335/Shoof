const STAR = "M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z";

function Star({ on }: { on: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill={on ? "#dba40c" : "#e6eaf3"}>
      <path d={STAR} />
    </svg>
  );
}

/** Read-only star row for an average rating. Star i is filled once the average reaches i - 0.25. */
export function Stars({ avg }: { avg: number }) {
  return (
    <span className="starrow" role="img" aria-label={`${avg.toFixed(1)} out of 5 stars`}>
      <Star on={avg >= 0.75} />
      <Star on={avg >= 1.75} />
      <Star on={avg >= 2.75} />
      <Star on={avg >= 3.75} />
      <Star on={avg >= 4.75} />
    </span>
  );
}
