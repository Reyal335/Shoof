"use client";

import { cloneElement, useState } from "react";
import { FollowButton } from "@/components/follow-button";
import { Header } from "@/components/header";
import { SectionNav } from "@/components/section-nav";
import { Tabs } from "@/components/tabs";
import { dataOf, type Card } from "@/lib/cards";
import { plural } from "@/lib/plural";
import "./games.css";

const GENRES = [
  { value: "All", label: "ALL" },
  { value: "Arcade", label: "ARCADE" },
  { value: "Puzzle", label: "PUZZLE" },
  { value: "Platformer", label: "PLATFORMER" },
  { value: "Multiplayer", label: "MULTIPLAYER" },
  { value: "Game jam", label: "GAME JAM" },
];

export function GamesPage() {
  const [genre, setGenre] = useState("All");
  const isVisible = (card: Card) => genre === "All" || dataOf(card, "genre") === genre;
  const count = cards.filter(isVisible).length;

  return (
    <>
      <Header />
      <main className="wrap">
        <SectionNav current="games" />
        <section className="ghero">
          <div className="ghero-l">
            <h1>GAMES</h1>
            <p>Browser games you can play right now. No installs, no downloads, no store page.</p>
            <div className="frow">
              <FollowButton className="follow" on="FOLLOWING" off="FOLLOW GAMES" hint={{ on: "Games show first on your home feed.", off: "Follow to see games first on your home feed." }} />
            </div>
          </div>
          <div className="gotw">
            <div className="gotw-top"><b>GAME OF THE WEEK</b><span>[yourgame].example.com</span></div>
            <div className="gotw-shot cells" role="img" aria-label="Preview of the game of the week"><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c1" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" />
              <a className="playbig" href="#play" aria-label="Play the game of the week"><svg width="36" height="36" viewBox="0 0 24 24" fill="#0d1226" aria-hidden="true"><path d="M8 5l12 7-12 7z" /></svg></a>
            </div>
            <div className="gotw-info">
              <div><b>[Game title]</b><span>by [Creator] · Arcade · ~5 min</span></div>
              <div className="ctl" style={{ flexDirection: 'row' }}><span>Keyboard</span><span>Gamepad</span></div>
            </div>
          </div>
        </section>
        <section className="jam" aria-label="Current game jam">
          <div className="jam-l"><b>GAME JAM</b><span>Theme: [Jam theme] · Ends in [3 days] · [24] entries so far</span></div>
          <div className="jam-r"><a className="a" href="#jam">JOIN THE JAM</a><a className="b" href="#entries">See entries</a></div>
        </section>
        <div className="bar">
          <Tabs label="Genre" options={GENRES} value={genre} onChange={setGenre} />
          <span id="count" aria-live="polite">{plural(count, "game", "games")}</span>
        </div>
        <div className="gmain">
          <section className="ggrid" aria-label="Games">
            {cards.map((card) => cloneElement(card, { hidden: !isVisible(card) }))}
            <div className="empty" id="empty" hidden={count !== 0}>No games in this genre yet. Make the first one.</div>
          </section>
          <aside className="top5" aria-label="Most played this week">
            <h2>MOST PLAYED</h2>
            <ol><li><a href="#play"><span className="rank">1</span><span className="t"><b>[Game title]</b><span>Multiplayer · 3.2k plays</span></span></a></li><li><a href="#play"><span className="rank">2</span><span className="t"><b>[Game title]</b><span>Arcade · 2.4k plays</span></span></a></li><li><a href="#play"><span className="rank">3</span><span className="t"><b>[Game title]</b><span>Puzzle · 1.1k plays</span></span></a></li><li><a href="#play"><span className="rank">4</span><span className="t"><b>[Game title]</b><span>Platformer · 860 plays</span></span></a></li><li><a href="#play"><span className="rank">5</span><span className="t"><b>[Game title]</b><span>Puzzle · 720 plays</span></span></a></li></ol>
            <p>Counts plays started from Shoof in the last 7 days.</p>
          </aside>
        </div>
      </main>
    </>
  );
}

// The game cards, written out as in design/Games.html. Filtering reads their data-genre and toggles `hidden`.
const cards: Card[] = [
  <article key="1" className="gcard" data-genre="Arcade">
    <div className="gshot cells" role="img" aria-label="Preview of [Game title]"><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="gtag">Arcade</span></div>
    <div className="gbody">
      <div><h3>[Game title]</h3><span className="meta">by [Creator] · ~5 min · 2.4k plays</span></div>
      <div className="ctl"><span>Keyboard</span><span className="st">TypeScript</span><span className="st">Phaser</span></div>
      <a className="play" href="#play"><svg width="14" height="14" viewBox="0 0 24 24" fill="#0d1226" aria-hidden="true"><path d="M6 4l15 8-15 8z" /></svg>PLAY</a>
    </div>
  </article>,
  <article key="2" className="gcard" data-genre="Puzzle">
    <div className="gshot cells" role="img" aria-label="Preview of [Game title]"><span className="c2" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c1" /><span className="c1" /><span className="gtag">Puzzle</span></div>
    <div className="gbody">
      <div><h3>[Game title]</h3><span className="meta">by [Creator] · ~10 min · 1.1k plays</span></div>
      <div className="ctl"><span>Mouse</span><span>Touch</span><span className="st">React</span></div>
      <a className="play" href="#play"><svg width="14" height="14" viewBox="0 0 24 24" fill="#0d1226" aria-hidden="true"><path d="M6 4l15 8-15 8z" /></svg>PLAY</a>
    </div>
  </article>,
  <article key="3" className="gcard" data-genre="Platformer">
    <div className="gshot cells" role="img" aria-label="Preview of [Game title]"><span className="c2" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="gtag">Platformer</span></div>
    <div className="gbody">
      <div><h3>[Game title]</h3><span className="meta">by [Creator] · ~15 min · 860 plays</span></div>
      <div className="ctl"><span>Keyboard</span><span>Gamepad</span><span className="st">Godot</span></div>
      <a className="play" href="#play"><svg width="14" height="14" viewBox="0 0 24 24" fill="#0d1226" aria-hidden="true"><path d="M6 4l15 8-15 8z" /></svg>PLAY</a>
    </div>
  </article>,
  <article key="4" className="gcard" data-genre="Multiplayer">
    <div className="gshot cells" role="img" aria-label="Preview of [Game title]"><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="gtag">Multiplayer</span></div>
    <div className="gbody">
      <div><h3>[Game title]</h3><span className="meta">by [Creator] · ~20 min · 3.2k plays</span></div>
      <div className="ctl"><span>Keyboard</span><span className="st">Node.js</span><span className="st">Canvas</span></div>
      <a className="play" href="#play"><svg width="14" height="14" viewBox="0 0 24 24" fill="#0d1226" aria-hidden="true"><path d="M6 4l15 8-15 8z" /></svg>PLAY</a>
    </div>
  </article>,
  <article key="5" className="gcard" data-genre="Game jam">
    <div className="gshot cells" role="img" aria-label="Preview of [Game title]"><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c1" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="gtag">Game jam</span></div>
    <div className="gbody">
      <div><h3>[Game title]</h3><span className="meta">by [Creator] · ~3 min · 540 plays</span></div>
      <div className="ctl"><span>Touch</span><span className="st">JavaScript</span></div>
      <a className="play" href="#play"><svg width="14" height="14" viewBox="0 0 24 24" fill="#0d1226" aria-hidden="true"><path d="M6 4l15 8-15 8z" /></svg>PLAY</a>
    </div>
  </article>,
  <article key="6" className="gcard" data-genre="Puzzle">
    <div className="gshot cells" role="img" aria-label="Preview of [Game title]"><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c1" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="gtag">Puzzle</span></div>
    <div className="gbody">
      <div><h3>[Game title]</h3><span className="meta">by [Creator] · ~5 min · 720 plays</span></div>
      <div className="ctl"><span>Mouse</span><span className="st">Svelte</span></div>
      <a className="play" href="#play"><svg width="14" height="14" viewBox="0 0 24 24" fill="#0d1226" aria-hidden="true"><path d="M6 4l15 8-15 8z" /></svg>PLAY</a>
    </div>
  </article>
];
