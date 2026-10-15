"use client";

import { Stars } from "@/components/stars";

export type StarValue = 1 | 2 | 3 | 4 | 5;
export type Distribution = Record<StarValue, number>;

type Props = {
  dist: Distribution;
  avg: number;
  count: number;
  /** Your rating on this page, or 0 before you pick one. */
  mine: StarValue | 0;
  onRate: (value: StarValue) => void;
};

const STAR = "M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z";

type OptionProps = { value: StarValue; text: string; mine: StarValue | 0; onRate: (value: StarValue) => void };

function RateOption({ value, text, mine, onRate }: OptionProps) {
  return (
    <>
      <input type="radio" name="rate" id={`rate-${value}`} value={value} checked={mine === value} onChange={() => onRate(value)} />
      <label htmlFor={`rate-${value}`} className={value <= mine ? "on" : undefined}><span className="sr">{text}</span><svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path d={STAR} /></svg></label>
    </>
  );
}

/** Average, distribution bars and "Your rating" (five visually hidden radios with 44px star labels). */
export function Ratings({ dist, avg, count, mine, onRate }: Props) {
  const width = (star: StarValue) => ({ width: `${((dist[star] / count) * 100).toFixed(1)}%` });

  return (
    <section className="card sec" aria-labelledby="h-ratings">
      <h2 id="h-ratings">Ratings</h2>
      <div className="rgrid">
        <div className="avg"><b>{avg.toFixed(1)}</b><span><Stars avg={avg} /></span><span><span>{count}</span> ratings</span></div>
        <ol className="bars" aria-label="Ratings by stars">
          <li><span>5 stars</span><span className="bar"><i style={width(5)} /></span><span className="c">{dist[5]}</span></li>
          <li><span>4 stars</span><span className="bar"><i style={width(4)} /></span><span className="c">{dist[4]}</span></li>
          <li><span>3 stars</span><span className="bar"><i style={width(3)} /></span><span className="c">{dist[3]}</span></li>
          <li><span>2 stars</span><span className="bar"><i style={width(2)} /></span><span className="c">{dist[2]}</span></li>
          <li><span>1 star</span><span className="bar"><i style={width(1)} /></span><span className="c">{dist[1]}</span></li>
        </ol>
        <fieldset className="yours">
          <legend>Your rating</legend>
          <div className="rate">
            <RateOption value={1} text="1 star" mine={mine} onRate={onRate} />
            <RateOption value={2} text="2 stars" mine={mine} onRate={onRate} />
            <RateOption value={3} text="3 stars" mine={mine} onRate={onRate} />
            <RateOption value={4} text="4 stars" mine={mine} onRate={onRate} />
            <RateOption value={5} text="5 stars" mine={mine} onRate={onRate} />
          </div>
          <span id="rate-msg" role="status" aria-live="polite">{mine ? `You rated this ${mine} out of 5. Thanks!` : "Pick a number of stars."}</span>
        </fieldset>
      </div>
    </section>
  );
}
