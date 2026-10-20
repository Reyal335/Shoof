"use client";

import Link from "next/link";
import Image from "next/image";
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
import { firstLine } from "@/lib/text";
import { plural } from "@/lib/plural";
import "./misc.css";

const GEN_COLORS = ["#dba40c", "#9db4f0", "#ef6f6f", "#2ec4b6", "#eef1f8"];

/** One of the design's six drawn previews, picked by the post id, until the project has a screenshot. */
function StandIn({ post }: { post: Post }) {
  const seed = seedOf(post.id);
  switch (seed % 6) {
    case 0:
      return <div className="m-gen">{Array.from({ length: 14 }, (_, i) => { const size = 18 + ((seed + i * 17) % 44); return <i key={i} style={{ width: `${size}px`, height: `${size}px`, background: GEN_COLORS[i % 5] }} />; })}</div>;
    case 1:
      return <div className="m-tool"><div className="in">paste something here</div><div className="ar"><b>↓</b><i /></div><div className="out"><i style={{ width: '80%', background: '#eef1f8' }} /><i style={{ width: '56%', background: '#9db4f0' }} /></div></div>;
    case 2:
      return <div className="m-ext"><div className="tb"><i className="u" /><i className="a" /><i className="y" /></div><div className="pop"><div><i style={{ width: '60px', background: '#101b33' }} /><i className="sw" style={{ background: '#101b33' }} /></div><div><i style={{ width: '72px', background: '#9aa5c0' }} /><i className="sw" style={{ background: '#c3cadb' }} /></div></div></div>;
    case 3:
      return <div className="m-ai"><div className="usr"><i style={{ width: '120px' }} /><i style={{ width: '80px' }} /></div><div className="bot"><i style={{ width: '140px' }} /><i style={{ width: '100px', background: '#9aa5c0' }} /></div><div className="typing"><i /><i style={{ background: '#5b6a92' }} /><i style={{ background: '#9aa5c0' }} /></div></div>;
    case 4:
      return <div className="m-toy"><span className="btn">PRESS</span><span className="ct">{`opened ${post.visitCount.toLocaleString("en-US")} times`}</span></div>;
    default:
      return <div className="m-exp"><span>SCROLL</span><span className="o">SCROLL</span><span style={{ paddingLeft: '60px' }}>SCROLL</span></div>;
  }
}

function ProjectCard({ post, wide, picked, onVisit }: { post: Post; wide: boolean; picked: boolean; onVisit: (id: string) => void }) {
  const cover = coverUrl(post);
  return (
    <article id={`post-${post.id}`} className={["mcard", wide && "wide", picked && "picked"].filter(Boolean).join(" ")}>
      <div className="mshot" role="img" aria-label={`Preview of ${post.caption}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- media can sit on any https host */}
        {cover ? <img className="cover-img" src={cover} alt="" /> : <StandIn post={post} />}
        <span className="ptag" hidden={!picked}>Picked for you</span>
      </div>
      <div className="mbody">
        <span className="kind">{post.skills.length ? post.skills.slice(0, 2).map((s) => s.name).join(" · ") : "Misc"}</span>
        <h3><Link className="title-link" href={postHref(post)}>{post.caption}</Link></h3>
        <p>{firstLine(post.description)}</p>
        <div className="mfoot">
          <span>{post.author ? <>by <Link href={profileHref(post.author.username)}>{post.author.displayName}</Link></> : "by a former member"}</span>
          <a className="try" href={post.link} target="_blank" rel="noopener noreferrer nofollow ugc" aria-label={`Try ${post.caption}`} onClick={() => onVisit(post.id)}>Try it ↗</a>
        </div>
      </div>
    </article>
  );
}

// From design/Misc.html, with real posts in the misc section. The kind tabs became the section's most used skills.
export function MiscPage() {
  const [tab, setTab] = useState(ALL);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const tabs = useSkillTabs("misc");
  const list = usePostList({ kind: "all" }, { category: "misc", sort: "new", skill: skillFilter(tab) });
  const visit = useVisit();
  const picked = list.posts.find((post) => post.id === pickedId);

  function selectTab(value: string) {
    setTab(value);
    setPickedId(null);
  }

  // First press picks the third card, later presses jump three ahead, wrapping round.
  function shoofMe() {
    const posts = list.posts;
    if (!posts.length) return;
    const i = posts.findIndex((post) => post.id === pickedId);
    const next = posts[i < 0 ? 2 % posts.length : (i + 3) % posts.length];
    setPickedId(next.id);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(`post-${next.id}`)?.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <>
      <Header />
      <main className="wrap">
        <SectionNav current="misc" />
        <section className="mhero">
          <div className="mascot"><Image src="/shoof-blob-navy.svg" alt="Shoof mascot" width={150} height={148} priority /></div>
          <div className="mhero-r">
            <h1>Miscellaneous</h1>
            <p>Toys, tools, experiments and things that don&apos;t fit in a box. The weird corner of Shoof.</p>
            <div className="mact">
              <button type="button" className="shoofme" id="shoofme" onClick={shoofMe} disabled={!list.posts.length}>Shoof me something</button>
              <FollowButton className="follow" on="Following" off="Follow Misc" />
              <span id="pick" role="status">{picked ? `Try ${picked.caption}.` : ""}</span>
            </div>
          </div>
        </section>
        <div className="bar">
          {tabs.length > 1 ? <Tabs label="Built with" options={tabs} value={tab} onChange={selectTab} /> : <span />}
          <span id="count" aria-live="polite">{list.isPending ? "" : plural(list.total, "thing", "things")}</span>
        </div>
        {list.posts.length > 0 && (
          <section className="mgrid" aria-label="Projects">
            {list.posts.map((post, i) => (
              <ProjectCard key={post.id} post={post} wide={i % 6 === 0 || i % 6 === 5} picked={post.id === pickedId} onVisit={visit} />
            ))}
          </section>
        )}
        <ListStatus list={list} className="empty" empty={tab === ALL ? <>Nothing weird enough yet. <Link href="/post/new">Post something</Link>.</> : "Nothing built with this yet."} />
        <MoreButton list={list} label="Show more things" />
      </main>
    </>
  );
}
