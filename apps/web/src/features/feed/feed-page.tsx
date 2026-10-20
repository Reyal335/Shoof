"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/avatar";
import { Header } from "@/components/header";
import { useSession } from "@/features/auth/hooks/use-session";
import { ListStatus, MoreButton } from "@/features/posts/components/list-states";
import { RatingChip } from "@/features/posts/components/rating-chip";
import { usePostList } from "@/features/posts/hooks/use-post-list";
import { useTopSkills } from "@/features/posts/hooks/use-top-skills";
import { useVisit } from "@/features/posts/hooks/use-visit";
import { coverUrl, hostOf, postHref, profileHref } from "@/features/posts/paths";
import { CATEGORY_LABELS } from "@/features/posts/post-form";
import type { Post, PostScope, PostSort } from "@/features/posts/types";
import { useSkills } from "@/features/skills/hooks/use-skills";
import { chartBars, gameCells, seedOf } from "@/lib/stand-ins";
import { firstLine } from "@/lib/text";
import { plural } from "@/lib/plural";
import "./feed.css";

type Tab = "top" | "new" | "following";

const TABS: { value: Tab; label: string }[] = [
  { value: "top", label: "Top rated" },
  { value: "new", label: "New" },
  { value: "following", label: "Following" },
];

const ARROW = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#101b33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg>;

/** Drawn preview in the feed design's style, until the post has a screenshot. */
function StandIn({ post }: { post: Post }) {
  const seed = seedOf(post.id);
  switch (post.category) {
    case "games":
      return <div className="pv game">{gameCells(seed, 72).map((cell, i) => <span key={i} className={cell} />)}</div>;
    case "portfolios":
      return <div className="pv portfolio"><div className="pf-nav"><i className="pf-logo" /><span><i /><i /><i /></span></div><div className="pf-hero"><div className="pf-text"><b style={{ width: `${80 + (seed % 15)}%` }} /><b style={{ width: `${50 + (seed % 25)}%` }} /><em /></div><div className="pf-dot" /></div><div className="pf-row"><i /><i /><i /></div></div>;
    case "css_ui":
      return <div className="pv css"><div className="row1"><i style={{ flex: "1", background: "#101b33" }} /><i style={{ flex: `${1 + (seed % 3)}`, background: "#dba40c" }} /><i style={{ flex: "1", background: "#7d89a8" }} /></div><div className="row2"><i style={{ flex: "1", background: "#9db4f0" }} /><div className="col"><i style={{ background: "#101b33" }} /><i style={{ background: "#fff" }} /></div></div></div>;
    case "saas":
      return <div className="pv saas"><div className="side"><i className="sq" /><i /><i /><i /></div><div className="main"><div className="tiles"><i /><i /><i /></div><div className="chart">{chartBars(seed, 10, 30, 76).map((h, i) => <i key={i} style={{ height: `${h}px` }} />)}</div></div></div>;
    case "misc":
      return <div className="pv misc"><Image src="/shoof-blob.svg" alt="" width={96} height={95} /></div>;
  }
}

function Cover({ post }: { post: Post }) {
  const cover = coverUrl(post);
  // eslint-disable-next-line @next/next/no-img-element -- media can sit on any https host
  return cover ? <img className="cover-img" src={cover} alt="" /> : <StandIn post={post} />;
}

function Creator({ post, featured }: { post: Post; featured?: boolean }) {
  if (!post.author) return <span className="cname">Former member</span>;
  return (
    <Link className="creator-link" href={profileHref(post.author.username)}>
      <Avatar user={post.author} className="avatar" />
      {featured ? <b style={{ fontSize: "15px" }}>{post.author.displayName}</b> : <span className="cname">{post.author.displayName}</span>}
    </Link>
  );
}

function FeedCard({ post, onVisit }: { post: Post; onVisit: (id: string) => void }) {
  return (
    <article className="card">
      <div className="preview">
        <div className="pic" role="img" aria-label={`Preview of ${post.caption}`}><Cover post={post} /></div>
        <span className="badge">{CATEGORY_LABELS[post.category]}</span>
        <a className="visit" href={post.link} target="_blank" rel="noopener noreferrer nofollow ugc" aria-label={`Visit ${post.caption}`} onClick={() => onVisit(post.id)}>{ARROW}</a>
      </div>
      <div className="card-body">
        <div>
          <h3><Link className="title-link" href={postHref(post)}>{post.caption}</Link></h3>
          <p>{firstLine(post.description)}</p>
        </div>
        {post.skills.length > 0 && <div className="chips">{post.skills.slice(0, 4).map((skill) => <span key={skill.id} className="chip">{skill.name}</span>)}</div>}
        <div className="card-foot">
          <div className="creator"><Creator post={post} /></div>
          <RatingChip rating={post.rating} count={post.ratingCount} />
        </div>
      </div>
    </article>
  );
}

/** The best-rated site, big, while no stack filter is on. Hidden until something has been rated. */
function Featured({ onVisit }: { onVisit: (id: string) => void }) {
  const top = usePostList({ kind: "all" }, { sort: "top" }, { pageSize: 1 });
  const post = top.posts[0];
  if (!post || !post.ratingCount) return null;
  const cover = coverUrl(post);

  return (
    <article className="featured" id="featured">
      <div className="feat-shot" role="img" aria-label={`Preview of ${post.caption}`}>
        <div className="dots"><i style={{ background: "#ef6f6f" }} /><i style={{ background: "#dba40c" }} /><i style={{ background: "#4fd1a5" }} /><span className="url">{hostOf(post.link)}</span></div>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- media can sit on any https host
          <img className="cover-img feat-cover" src={cover} alt="" />
        ) : post.category === "games" ? (
          <div className="feat-game">{gameCells(seedOf(post.id), 96).map((cell, i) => <span key={i} className={cell} />)}</div>
        ) : (
          <div className="feat-pv"><StandIn post={post} /></div>
        )}
      </div>
      <div className="feat-info">
        <span className="feat-tag">Top rated</span>
        <h2>{post.caption}</h2>
        <p>{firstLine(post.description, 220)}</p>
        {post.skills.length > 0 && <div className="chips">{post.skills.slice(0, 5).map((skill) => <span key={skill.id} className="chip">{skill.name}</span>)}</div>}
        <div className="feat-by"><Creator post={post} featured /><RatingChip rating={post.rating} count={post.ratingCount} /></div>
        <div className="feat-btns">
          <a className="btn-dark" href={post.link} target="_blank" rel="noopener noreferrer nofollow ugc" onClick={() => onVisit(post.id)}>Visit live site <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg></a>
          <Link className="btn-line" href={postHref(post)}>Details</Link>
        </div>
      </div>
    </article>
  );
}

/**
 * The home feed. `initialSkill` comes from ?skill= (the post page's "Built with" chips link here), so
 * "sites built with Next.js" is a shareable address.
 */
export function FeedPage({ initialSkill }: { initialSkill?: string }) {
  const session = useSession();
  const [skill, setSkill] = useState<string | null>(initialSkill ?? null);
  const [tab, setTab] = useState<Tab>("top");
  const topSkills = useTopSkills();
  const { state: catalog } = useSkills();
  const visit = useVisit();

  const scope: PostScope = tab === "following" ? { kind: "following" } : { kind: "all" };
  const sort: PostSort = tab === "following" ? "new" : tab;
  const list = usePostList(scope, { sort, skill: skill ?? undefined }, { enabled: tab !== "following" || session.isAuthenticated });

  // The chips: the most used skills, plus the one from the address if it isn't among them
  const chips = topSkills.map((usage) => usage.skill);
  if (skill && !chips.some((s) => s.slug === skill)) {
    const known = catalog.status === "ready" ? catalog.skills.find((s) => s.slug === skill) : undefined;
    chips.unshift(known ?? { id: skill, slug: skill, name: skill, kind: "discipline" });
  }

  function pickSkill(next: string | null) {
    setSkill(next);
    // Keeps the address shareable without a navigation
    window.history.replaceState(null, "", next ? `/?skill=${encodeURIComponent(next)}` : "/");
  }

  const signedOutFollowing = tab === "following" && session.status === "anonymous";

  return (
    <>
      <Header current="home" />
      <main className="wrap">
        <div className="intro">
          <h1>Sites people are shipping right now.</h1>
          <p>See the real thing first. Open any card and the site is live.</p>
        </div>
        <div className="filters">
          <nav className="tabs" aria-label="Sections"><Link className="tab active" href="/" aria-current="page">All</Link><Link className="tab" href="/games"><i className="sw" style={{ background: '#0d1226', boxShadow: 'inset 0 0 0 3px #2ec4b6', borderRadius: '2px' }} />Games</Link><Link className="tab" href="/portfolios"><i className="sw" style={{ background: '#fff', border: '1.5px solid #101b33', borderRadius: '6px' }} />Portfolios</Link><Link className="tab" href="/saas"><i className="sw" style={{ background: '#1b3a8a', borderRadius: '3px' }} />SaaS</Link><Link className="tab" href="/css-ui"><i className="sw" style={{ background: '#9db4f0', border: '1.5px solid #101b33', borderRadius: '3px' }} />CSS &amp; UI</Link><Link className="tab" href="/misc"><i className="sw" style={{ background: '#dba40c', borderRadius: '6px' }} />Misc</Link></nav>
          {chips.length > 0 && (
            <div className="stacks" role="group" aria-label="Built with">
              <span className="label">Built with</span>
              {chips.map((s) => (
                <button key={s.slug} type="button" className="stack" aria-pressed={skill === s.slug} onClick={() => pickSkill(skill === s.slug ? null : s.slug)}>
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {!skill && tab === "top" && <Featured onVisit={visit} />}
        <div className="bar">
          <span id="count" aria-live="polite">{list.isPending || signedOutFollowing ? "" : plural(list.total, "site", "sites")}</span>
          <div className="sort" role="group" aria-label="Sort">
            {TABS.map((t) => (
              <button key={t.value} type="button" aria-pressed={tab === t.value} className={tab === t.value ? "on" : undefined} onClick={() => setTab(t.value)}>{t.label}</button>
            ))}
          </div>
        </div>
        {signedOutFollowing ? (
          <div className="empty"><Link href="/login?next=/">Log in</Link> to see sites from the people you follow.</div>
        ) : (
          <>
            <ListStatus
              list={list}
              className="empty"
              empty={
                tab === "following"
                  ? <>Nothing from the people you follow yet. Find creators on their sites&apos; pages and follow them.</>
                  : skill
                    ? <>No sites built with this yet. <button type="button" className="more-btn" onClick={() => pickSkill(null)}>Clear the filter</button></>
                    : <>No sites yet. <Link href="/post/new">Post the first one</Link>.</>
              }
            />
            {list.posts.length > 0 && (
              <section className="grid" id="grid" aria-label="Sites">
                {list.posts.map((post) => <FeedCard key={post.id} post={post} onVisit={visit} />)}
              </section>
            )}
            <MoreButton list={list} label="Show more sites" />
          </>
        )}
      </main>
    </>
  );
}
