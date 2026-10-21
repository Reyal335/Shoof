"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ListStatus, MoreButton } from "@/features/posts/components/list-states";
import { usePostList } from "@/features/posts/hooks/use-post-list";
import { useVisit } from "@/features/posts/hooks/use-visit";
import { coverUrl, postHref } from "@/features/posts/paths";
import { CATEGORY_LABELS } from "@/features/posts/post-form";
import type { Page, Post } from "@/features/posts/types";
import { chartBars, gameCells, seedOf } from "@/lib/stand-ins";
import { firstLine } from "@/lib/text";
import { PROFILE_SITES_PAGE } from "../sites";

/** The same list (and cache entry) ProfileSites and ProfileStats read. */
export function useProfileSites(username: string, initialPage?: Page<Post>) {
  return usePostList({ kind: "user", username }, {}, { pageSize: PROFILE_SITES_PAGE, initialPage });
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg>
  );
}

/** Drawn preview in the profile design's style, until the post has a screenshot. */
function StandIn({ post }: { post: Post }) {
  const seed = seedOf(post.id);
  switch (post.category) {
    case "games":
      return <div className="game">{gameCells(seed, 72).map((cell, i) => <span key={i} className={cell} />)}</div>;
    case "portfolios":
      return (
        <div className="port">
          <div className="r"><i style={{ width: "54px", height: "8px", background: "#101b33" }} /><div style={{ display: "flex", gap: "10px" }}><i /><i /></div></div>
          <div className="mid"><div className="ln"><i style={{ width: `${80 + (seed % 15)}%` }} /><i style={{ width: `${50 + (seed % 25)}%` }} /><i style={{ width: "54px", height: "22px", borderRadius: "11px", background: "#dba40c", marginTop: "8px" }} /></div><div style={{ width: "88px", height: "88px", borderRadius: "50%", background: "#dba40c", flexShrink: 0 }} /></div>
          <div className="row3"><i /><i /><i /></div>
        </div>
      );
    case "saas":
      return (
        <div className="saas"><div className="nav"><i /><i /><i /></div><div className="body"><div className="k"><i /><i /><i /></div><div className="chart">{chartBars(seed, 10, 26, 64).map((h, i) => <i key={i} style={{ height: `${h}px` }} />)}</div></div></div>
      );
    case "css_ui":
      return (
        <div className="css">
          <div className="a"><i style={{ flexGrow: 1, background: "#101b33" }} /><i style={{ flexGrow: 1 + (seed % 3), background: "#dba40c" }} /><i style={{ flexGrow: 1, background: "#7d89a8" }} /></div>
          <div className="b"><i style={{ flexGrow: 1, background: "#9db4f0" }} /><div><i style={{ flexGrow: 1, background: "#101b33" }} /><i style={{ flexGrow: 1, background: "#fff" }} /></div></div>
        </div>
      );
    case "misc":
      return <div className="misc-pic"><Image src="/shoof-blob.svg" alt="" width={96} height={95} /></div>;
  }
}

function SiteCard({ post, onVisit }: { post: Post; onVisit: (id: string) => void }) {
  const cover = coverUrl(post);
  return (
    <article className="card">
      <div className="shot">
        <div className="pic" role="img" aria-label={`Preview of ${post.caption}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- media can sit on any https host */}
          {cover ? <img className="cover-img" src={cover} alt="" /> : <StandIn post={post} />}
        </div>
        <span className="tag">{CATEGORY_LABELS[post.category]}</span>
        <a className="go" href={post.link} target="_blank" rel="noopener noreferrer nofollow ugc" aria-label={`Visit ${post.caption}`} onClick={() => onVisit(post.id)}><Arrow /></a>
      </div>
      <div className="lbody">
        <h3><Link className="title-link" href={postHref(post)}>{post.caption}</Link></h3>
        <p>{firstLine(post.description)}</p>
        {post.skills.length > 0 && <div className="chips">{post.skills.slice(0, 4).map((skill) => <span key={skill.id}>{skill.name}</span>)}</div>}
      </div>
    </article>
  );
}

/** A creator's posted sites, newest first, with "Show more". `empty` is what shows when they haven't posted. */
export function ProfileSites({ username, initialPage, empty }: { username: string; initialPage?: Page<Post>; empty: ReactNode }) {
  const list = useProfileSites(username, initialPage);
  const visit = useVisit();
  return (
    <>
      <ListStatus list={list} className="panel empty" empty={empty} />
      {list.posts.length > 0 && (
        <div className="sitegrid">
          {list.posts.map((post) => <SiteCard key={post.id} post={post} onVisit={visit} />)}
        </div>
      )}
      <MoreButton list={list} label="Show more sites" />
    </>
  );
}
