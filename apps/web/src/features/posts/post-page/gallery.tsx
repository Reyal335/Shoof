"use client";

import { useState } from "react";
import { LevelsShot, PlayShot, ScoresShot, TitleShot } from "./stand-ins";

// Used for the footer and the wrap-around; the screens and thumbnails themselves are written out below.
const NAMES = ["Gameplay", "Title screen", "Level select", "High scores"];

/** Screenshot viewer with Previous/Next (wrapping) and thumbnails. `onVisit` fires when "Open" is clicked. */
export function Gallery({ onVisit }: { onVisit: () => void }) {
  const [cur, setCur] = useState(0);
  const show = (i: number) => setCur((i + NAMES.length) % NAMES.length);

  return (
    <section className="media" aria-label="Screenshots">
      <div className="viewer">
        <div className="vbar">
          <i /><i /><i />
          <span className="url">yourgame.example.com</span>
          <a href="https://yourgame.example.com" target="_blank" rel="noopener noreferrer" className="vopen" aria-label="Open yourgame.example.com in a new tab" onClick={onVisit}>Open <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg></a>
        </div>
        <div className="screen">
          <div className="screen-item" hidden={cur !== 0} role="img" aria-label="Screenshot 1 of 4: Gameplay"><PlayShot /></div>
          <div className="screen-item" hidden={cur !== 1} role="img" aria-label="Screenshot 2 of 4: Title screen"><TitleShot /></div>
          <div className="screen-item" hidden={cur !== 2} role="img" aria-label="Screenshot 3 of 4: Level select"><LevelsShot /></div>
          <div className="screen-item" hidden={cur !== 3} role="img" aria-label="Screenshot 4 of 4: High scores"><ScoresShot /></div>
        </div>
        <div className="vfoot">
          <span aria-live="polite"><b>{NAMES[cur]}</b> &middot; <span>{cur + 1} of 4</span></span>
          <span className="vnav"><button type="button" aria-label="Previous screenshot" onClick={() => show(cur - 1)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg></button><button type="button" aria-label="Next screenshot" onClick={() => show(cur + 1)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg></button></span>
        </div>
      </div>
      <div className="thumbs" role="group" aria-label="Choose a screenshot">
        <button type="button" className="thumb" aria-pressed={cur === 0} aria-label="Show screenshot 1: Gameplay" onClick={() => show(0)}><PlayShot thumb /></button>
        <button type="button" className="thumb" aria-pressed={cur === 1} aria-label="Show screenshot 2: Title screen" onClick={() => show(1)}><TitleShot thumb /></button>
        <button type="button" className="thumb" aria-pressed={cur === 2} aria-label="Show screenshot 3: Level select" onClick={() => show(2)}><LevelsShot thumb /></button>
        <button type="button" className="thumb" aria-pressed={cur === 3} aria-label="Show screenshot 4: High scores" onClick={() => show(3)}><ScoresShot thumb /></button>
      </div>
    </section>
  );
}
