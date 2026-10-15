"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FollowButton } from "@/components/follow-button";

type Props = {
  avg: string;
  count: number;
  visits: string;
  onVisit: () => void;
};

/** Creator, Visit live site, View the code, Save/Share/Report and the facts list. */
export function SideCard({ avg, count, visits, onVisit }: Props) {
  const [saved, setSaved] = useState(false);
  const [shareLabel, setShareLabel] = useState("Share");
  const shareTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(shareTimer.current), []);

  function shareDone(label: string) {
    setShareLabel(label);
    window.clearTimeout(shareTimer.current);
    shareTimer.current = window.setTimeout(() => setShareLabel("Share"), 1600);
  }

  function share() {
    // Called inside the click handler so the browser treats it as a user gesture.
    if (!navigator.clipboard?.writeText) return shareDone("Copy failed");
    navigator.clipboard.writeText(location.href).then(() => shareDone("Link copied"), () => shareDone("Copy failed"));
  }

  return (
    <aside className="side" aria-label="About this post">
      <div className="card sidecard">
        <div className="creator">
          <Link className="av" href="/profile" aria-label="[Creator name]'s profile" tabIndex={-1}></Link>
          <div className="cname"><Link href="/profile">[Creator name]</Link><span>@handle &middot; Game developer</span></div>
          <FollowButton className="follow" on="Following" off="Follow" />
        </div>
        <a className="visit" href="https://yourgame.example.com" target="_blank" rel="noopener noreferrer" onClick={onVisit}>Visit live site <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg></a>
        <p className="host">Opens yourgame.example.com in a new tab</p>
        <a className="code" href="https://github.com/[you]/[project]" target="_blank" rel="noopener noreferrer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5" /></svg> View the code</a>
        <div className="acts">
          <button type="button" className="act" aria-pressed={saved} onClick={() => setSaved(!saved)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M6 3.5h12v17l-6-4-6 4z" /></svg> <span>{saved ? "Saved" : "Save"}</span></button>
          <button type="button" className="act" onClick={share}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg> <span>{shareLabel}</span></button>
          <a className="act" href="#report"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 21V4h11l-1.5 4L16 12H5" /></svg> <span>Report</span></a>
        </div>
        <dl className="facts">
          <dt>Category</dt><dd>Games</dd>
          <dt>Rating</dt><dd><span>{avg}</span> from <span>{count}</span></dd>
          <dt>Visits</dt><dd>{visits}</dd>
          <dt>Posted</dt><dd><time dateTime="2026-10-03">Oct 3, 2026</time></dd>
          <dt>Updated</dt><dd><time dateTime="2026-10-08">Oct 8, 2026</time></dd>
        </dl>
      </div>
    </aside>
  );
}
