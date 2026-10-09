"use client";

import { useEffect, useState } from "react";

export type NavSection = { id: string; label: string };

// A section counts as current once its top is this close to the viewport top (just under the sticky header).
const ACTIVE_OFFSET = 140;

/** In-page links to the settings groups. The current one (aria-current) follows clicks and scrolling. */
export function SettingsNav({ sections }: { sections: NavSection[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        let next = 0;
        sections.forEach((s, i) => {
          const el = document.getElementById(s.id);
          if (el && el.getBoundingClientRect().top <= ACTIVE_OFFSET) next = i;
        });
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) next = sections.length - 1;
        setCurrent(next);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  return (
    <nav className="snav" aria-label="Settings sections">
      {sections.map((s, i) => (
        <a key={s.id} href={`#${s.id}`} aria-current={i === current ? "true" : "false"} onClick={() => setCurrent(i)}>
          {s.label}
        </a>
      ))}
    </nav>
  );
}
