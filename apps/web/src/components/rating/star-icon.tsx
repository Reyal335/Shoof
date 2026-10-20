import type { CSSProperties } from "react";
import "./rating.css";

const PATH = "M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z";

/** The sizes the design uses: 14 chips and bar labels, 18 meta line, 20 summary, 28 empty state, 30 prompt, 32 input. */
export type StarSize = 14 | 16 | 18 | 20 | 28 | 30 | 32;

/**
 * One star in two layers: the outline (always drawn, so an empty star stays visible on any background) and the yellow
 * fill, clipped from the left to `fill` percent. Always decorative; the row or control around it carries the label.
 */
export function StarIcon({ size = 18, fill = 0 }: { size?: StarSize; fill?: number }) {
  const width = Math.max(0, Math.min(100, fill));
  return (
    <span className="rt-star" style={{ "--sz": `${size}px` } as CSSProperties} aria-hidden="true">
      <svg className="rt-star-line" viewBox="0 0 24 24"><path d={PATH} /></svg>
      {width > 0 && (
        <span className="rt-star-fill" style={{ width: `${width}%` }}>
          <svg viewBox="0 0 24 24"><path d={PATH} /></svg>
        </span>
      )}
    </span>
  );
}
