"use client";

import Link from "next/link";
import { useState } from "react";
import { FollowButton } from "@/components/follow-button";
import { Header } from "@/components/header";
import { SectionNav } from "@/components/section-nav";
import { Tabs } from "@/components/tabs";
import { ListStatus, MoreButton } from "@/features/posts/components/list-states";
import { usePostList } from "@/features/posts/hooks/use-post-list";
import { ALL, skillFilter, useSkillTabs } from "@/features/posts/hooks/use-skill-tabs";
import { useVisit } from "@/features/posts/hooks/use-visit";
import { coverUrl, hostOf, postHref } from "@/features/posts/paths";
import type { Post } from "@/features/posts/types";
import { gameCells, seedOf } from "@/lib/stand-ins";
import { plural } from "@/lib/plural";
import "./games.css";

const PLAY_ICON = <svg width="14" height="14" viewBox="0 0 24 24" fill="#0d1226" aria-hidden="true"><path d="M6 4l15 8-15 8z" /></svg>;

const by = (post: Post) => post.author?.displayName ?? "a former member";
const visits = (post: Post) => plural(post.visitCount, "play", "plays");

/** The game's screenshot, or pixel cells drawn from its id. */
function Shot({ post, cells }: { post: Post; cells: number }) {
  const cover = coverUrl(post);
  if (cover) {
    // eslint-disable-next-line @next/next/no-img-element -- media can sit on any https host
    return <img className="cover-img shot-img" src={cover} alt="" />;
  }
  return <>{gameCells(seedOf(post.id), cells).map((cell, i) => <span key={i} className={cell} />)}</>;
}

function GameCard({ post, onVisit }: { post: Post; onVisit: (id: string) => void }) {
  return (
    <article className="gcard">
      <div className={coverUrl(post) ? "gshot has-img" : "gshot cells"} role="img" aria-label={`Preview of ${post.caption}`}>
        <Shot post={post} cells={72} />
        {post.skills[0] && <span className="gtag">{post.skills[0].name}</span>}
      </div>
      <div className="gbody">
        <div><h3><Link className="title-link" href={postHref(post)}>{post.caption}</Link></h3><span className="meta">by {by(post)} · {visits(post)}</span></div>
        {post.skills.length > 0 && <div className="ctl">{post.skills.slice(0, 3).map((skill) => <span key={skill.id} className="st">{skill.name}</span>)}</div>}
        <a className="play" href={post.link} target="_blank" rel="noopener noreferrer nofollow ugc" aria-label={`Play ${post.caption}`} onClick={() => onVisit(post.id)}>{PLAY_ICON}PLAY</a>
      </div>
    </article>
  );
}

/** The best-rated game (the newest while nothing is rated), big, in the hero. */
function TopGame({ onVisit }: { onVisit: (id: string) => void }) {
  const top = usePostList({ kind: "all" }, { category: "games", sort: "top" }, { pageSize: 1 });
  const post = top.posts[0];
  if (!post) {
    return (
      <div className="gotw">
        <div className="gotw-top"><b>NO GAMES YET</b><span>be the first</span></div>
        <div className="gotw-info"><div><b>Made a browser game?</b><span>Post it and it shows up here.</span></div><Link className="play" href="/post/new" style={{ padding: "0 16px", marginTop: 0 }}>POST A GAME</Link></div>
      </div>
    );
  }
  return (
    <div className="gotw">
      <div className="gotw-top"><b>{post.ratingCount ? "TOP RATED GAME" : "NEWEST GAME"}</b><span>{hostOf(post.link)}</span></div>
      {/* No role="img" here: the Play link inside must stay reachable. The cells are empty spans, so nothing is read. */}
      <div className={coverUrl(post) ? "gotw-shot has-img" : "gotw-shot cells"}>
        <Shot post={post} cells={144} />
        <a className="playbig" href={post.link} target="_blank" rel="noopener noreferrer nofollow ugc" aria-label={`Play ${post.caption}`} onClick={() => onVisit(post.id)}><svg width="36" height="36" viewBox="0 0 24 24" fill="#0d1226" aria-hidden="true"><path d="M8 5l12 7-12 7z" /></svg></a>
      </div>
      <div className="gotw-info">
        <div><b><Link className="title-link" href={postHref(post)}>{post.caption}</Link></b><span>by {by(post)} · {visits(post)}</span></div>
        {post.skills.length > 0 && <div className="ctl" style={{ flexDirection: "row" }}>{post.skills.slice(0, 3).map((skill) => <span key={skill.id}>{skill.name}</span>)}</div>}
      </div>
    </div>
  );
}

/** The five games opened most from Shoof. */
function MostPlayed() {
  const most = usePostList({ kind: "all" }, { category: "games", sort: "visited" }, { pageSize: 5 });
  const played = most.posts.filter((post) => post.visitCount > 0);
  return (
    <aside className="top5" aria-label="Most played">
      <h2>MOST PLAYED</h2>
      {played.length ? (
        <ol>
          {played.map((post, i) => (
            <li key={post.id}><Link href={postHref(post)}><span className="rank">{i + 1}</span><span className="t"><b>{post.caption}</b><span>{visits(post)}</span></span></Link></li>
          ))}
        </ol>
      ) : (
        <p>Nothing played yet.</p>
      )}
      <p>Counts plays started from Shoof.</p>
    </aside>
  );
}

// From design/Games.html, with real posts in the games section. The genre tabs became the section's most used
// skills; the game-jam banner waits for a jams feature.
export function GamesPage() {
  const [tab, setTab] = useState(ALL);
  const tabs = useSkillTabs("games", { upper: true });
  const list = usePostList({ kind: "all" }, { category: "games", sort: "new", skill: skillFilter(tab) });
  const visit = useVisit();

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
          <TopGame onVisit={visit} />
        </section>
        <div className="bar">
          {tabs.length > 1 ? <Tabs label="Built with" options={tabs} value={tab} onChange={setTab} /> : <span />}
          <span id="count" aria-live="polite">{list.isPending ? "" : plural(list.total, "game", "games")}</span>
        </div>
        <div className="gmain">
          <section className="ggrid" aria-label="Games">
            {list.posts.map((post) => <GameCard key={post.id} post={post} onVisit={visit} />)}
            <ListStatus list={list} className="empty" empty={tab === ALL ? <>No games yet. <Link href="/post/new">Post the first one</Link>.</> : "No games built with this yet."} />
          </section>
          <MostPlayed />
        </div>
        <MoreButton list={list} label="Show more games" />
      </main>
    </>
  );
}
