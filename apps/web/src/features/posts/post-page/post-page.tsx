"use client";

// Where this page's content will come from once posts are fetched (the Post entity in apps/api):
//
// | Post field                       | Shows up as                                                                  |
// |----------------------------------|------------------------------------------------------------------------------|
// | caption                          | the h1, the "More from" card titles, the page title                          |
// | category (games, portfolios,     | the category chip, the middle breadcrumb, facts "Category", and the links to |
// |   saas, css_ui, misc)            |   the section route                                                          |
// | link                             | the viewer's URL pill (hostname only), "Open", "Visit live site",            |
// |                                  |   "Opens {hostname} in a new tab"                                            |
// | repoUrl                          | "View the code"                                                              |
// | description                      | "About this site" (one <p> per paragraph)                                    |
// | techStack                        | the "Built with" chips                                                       |
// | media                            | the gallery screens and thumbnails                                           |
// | rating, ratingCount, ratings     | the stars, average, counts and distribution                                  |
// | visitCount                       | "visits" in the meta line and facts                                          |
// | comments                         | the comments list and the count                                              |
// | createdAt, updatedAt             | "Posted" and "Updated"                                                       |
// | user                             | the creator card and "More from [Creator name]"                              |

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Stars } from "@/components/stars";
import { Comments } from "./comments";
import { Gallery } from "./gallery";
import { MoreFrom } from "./more-from";
import { Ratings, type Distribution, type StarValue } from "./ratings";
import { SideCard } from "./side-card";
import "./post.css";

const VISITS = 3412;

/** Scrolls to the element named by the URL hash (notifications link to #h-comments and #h-ratings), or to the top. */
function useHashScroll() {
  useEffect(() => {
    function scroll() {
      const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
      const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      if (target) target.scrollIntoView({ behavior, block: "start" });
      else if (!location.hash) window.scrollTo(0, 0);
    }
    scroll();
    window.addEventListener("hashchange", scroll);
    return () => window.removeEventListener("hashchange", scroll);
  }, []);
}

/** The post details page (mock): one posted site with its gallery, creator, ratings and comments. */
export function PostPage() {
  useHashScroll();

  // Visits count once per page view, from either "Visit live site" or the viewer's "Open".
  const [visited, setVisited] = useState(false);
  const visits = (VISITS + (visited ? 1 : 0)).toLocaleString("en-US");
  const visit = () => setVisited(true);

  // One rating per person, kept on this page only.
  const [dist, setDist] = useState<Distribution>({ 5: 92, 4: 24, 3: 8, 2: 3, 1: 1 });
  const [mine, setMine] = useState<StarValue | 0>(0);
  const count = dist[1] + dist[2] + dist[3] + dist[4] + dist[5];
  const sum = dist[1] + 2 * dist[2] + 3 * dist[3] + 4 * dist[4] + 5 * dist[5];
  const avg = Math.round((sum / count) * 10) / 10;

  function rate(value: StarValue) {
    const next = { ...dist };
    if (mine) next[mine]--;
    next[value]++;
    setDist(next);
    setMine(value);
  }

  return (
    <>
      <Header />
      <main className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb"><ol><li><Link href="/">All sites</Link></li><li><Link href="/games">Games</Link></li><li aria-current="page">This post</li></ol></nav>
        <div className="phead">
          <Link className="cat" href="/games">Games</Link>
          <h1>A tiny arcade game about a blob that can&apos;t stop bouncing</h1>
          <div className="meta">
            <span className="stars"><Stars avg={avg} /> <b>{avg.toFixed(1)}</b><span>(<span>{count}</span> ratings)</span></span>
            <span><b>{visits}</b> visits</span>
            <span>Posted <time dateTime="2026-10-03">Oct 3, 2026</time></span>
          </div>
        </div>

        <div className="pgrid">
          <Gallery onVisit={visit} />
          <SideCard avg={avg.toFixed(1)} count={count} visits={visits} onVisit={visit} />

          <div className="body">
            <section className="card sec prose" aria-labelledby="h-about">
              <h2 id="h-about">About this site</h2>
              <p>A one-button arcade game. You are a blob that bounces on its own: tap the screen or press Space to change direction, and collect the yellow cells before the timer runs out.</p>
              <p>I built it in a week for a game jam to learn Phaser&apos;s physics. Each level adds one new idea: moving walls, then sticky floors, then cells that run away from you.</p>
              <p>Feedback I&apos;d love: does level 3 feel too hard, and does the bounce feel fair on a phone?</p>
            </section>

            <section className="card sec" aria-labelledby="h-stack">
              <h2 id="h-stack">Built with</h2>
              <div className="stack"><Link href="/">TypeScript</Link><Link href="/">Phaser</Link><Link href="/">Vite</Link></div>
            </section>

            <Ratings dist={dist} avg={avg} count={count} mine={mine} onRate={rate} />
            <Comments />
          </div>
        </div>

        <MoreFrom />
      </main>
    </>
  );
}
