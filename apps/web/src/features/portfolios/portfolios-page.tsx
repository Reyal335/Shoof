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
import { coverUrl, postHref, profileHref } from "@/features/posts/paths";
import type { Post } from "@/features/posts/types";
import { seedOf } from "@/lib/stand-ins";
import "./portfolios.css";

/** One of the design's five drawn portfolio looks, picked by the post id, until the post has a screenshot. */
function StandIn({ post }: { post: Post }) {
  switch (seedOf(post.id) % 5) {
    case 0:
      return <div className="sh dark"><div className="r1"><i className="y" /><span><i /><i /></span></div><div className="mid"><b style={{ width: '80%', background: '#eef1f8' }} /><b style={{ width: '56%', background: '#dba40c' }} /><u style={{ width: '70%' }} /><u style={{ width: '50%' }} /></div><div className="r3"><i /><i /><i /></div></div>;
    case 1:
      return <div className="sh light"><div className="r1"><i className="n" /><span><i /><i /></span></div><div className="mid"><div className="t"><b style={{ width: '92%' }} /><b style={{ width: '64%' }} /><em /></div><i className="dot" /></div></div>;
    case 2:
      return <div className="sh gal"><i className="n" /><div className="g"><i style={{ gridRow: '1 / span 2', background: '#9db4f0' }} /><i style={{ background: '#dba40c' }} /><i style={{ background: '#26335c' }} /><i style={{ background: '#e6eaf3' }} /><i style={{ background: '#7d89a8' }} /></div></div>;
    case 3:
      return <div className="sh split"><div className="l"><i /></div><div className="r"><b style={{ width: '90%' }} /><b style={{ width: '70%' }} /><u style={{ width: '80%' }} /><u style={{ width: '60%' }} /></div></div>;
    default:
      return <div className="sh type"><span>{post.author?.displayName ?? "Portfolio"}</span><hr /><u style={{ width: '92%' }} /><u style={{ width: '86%' }} /><u style={{ width: '74%' }} /><u style={{ width: '88%' }} /></div>;
  }
}

function PortfolioCard({ post, big, onVisit }: { post: Post; big: boolean; onVisit: (id: string) => void }) {
  const cover = coverUrl(post);
  return (
    <article className={big ? "pcard big" : "pcard"}>
      <a className="plink" href={post.link} target="_blank" rel="noopener noreferrer nofollow ugc" aria-label={`Visit ${post.caption}`} onClick={() => onVisit(post.id)}>
        <div role="img" aria-label={`Preview of ${post.caption}`} style={{ display: 'flex', flexGrow: '1' }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- media can sit on any https host */}
          {cover ? <img className="cover-img sh" src={cover} alt="" /> : <StandIn post={post} />}
        </div>
      </a>
      <div className="pmeta">
        <div>
          <span className="spot">Spotlight</span>
          <h3><Link className="title-link" href={postHref(post)}>{post.caption}</Link></h3>
          <span className="role">
            {post.author ? <>by <Link href={profileHref(post.author.username)}>{post.author.displayName}</Link></> : "by a former member"}
            {post.skills.length > 0 && ` · ${post.skills.slice(0, 3).map((s) => s.name).join(", ")}`}
          </span>
        </div>
        <a className="visit" href={post.link} target="_blank" rel="noopener noreferrer nofollow ugc" aria-label={`Visit ${post.caption}`} onClick={() => onVisit(post.id)}>Visit ↗</a>
      </div>
    </article>
  );
}

// From design/Portfolios.html, with real posts in the portfolios section. The discipline tabs became the section's
// most used skills; "Open to work" waits for profiles to carry it.
export function PortfoliosPage() {
  const [tab, setTab] = useState(ALL);
  const tabs = useSkillTabs("portfolios");
  const list = usePostList({ kind: "all" }, { category: "portfolios", sort: "new", skill: skillFilter(tab) });
  const visit = useVisit();
  // The first card becomes the big Spotlight card, but only when there are enough cards to fill around it.
  const spotlight = list.posts.length > 2 ? list.posts[0].id : null;

  return (
    <>
      <Header />
      <main className="wrap">
        <SectionNav current="portfolios" />
        <section className="phero">
          <h1>Portfolios,<br /><em>worth a closer look.</em></h1>
          <div className="phero-r">
            <p>Personal sites from developers, designers, illustrators and writers. Shown as they are, with who made them and what they build with.</p>
            <div className="frow">
              <FollowButton className="follow" on="Following" off="Follow Portfolios" hint={{ on: "Portfolios show first on your home feed.", off: "Follow to see portfolios first." }} />
            </div>
          </div>
        </section>
        {tabs.length > 1 && (
          <div className="bar">
            <Tabs label="Built with" options={tabs} value={tab} onChange={setTab} />
          </div>
        )}
        {list.posts.length > 0 && (
          <section className="pgrid" aria-label="Portfolios">
            {list.posts.map((post) => <PortfolioCard key={post.id} post={post} big={post.id === spotlight} onVisit={visit} />)}
          </section>
        )}
        <ListStatus list={list} className="empty" empty={tab === ALL ? <>Nothing here yet. <Link href="/post/new">Post your portfolio</Link>.</> : "Nothing built with this yet. Try another tab."} />
        <MoreButton list={list} label="Show more portfolios" />
      </main>
    </>
  );
}
