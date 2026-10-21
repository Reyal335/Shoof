"use client";

import Link from "next/link";
import { useState } from "react";
import { FollowButton } from "@/components/follow-button";
import { Header } from "@/components/header";
import { SectionNav, type Section } from "@/components/section-nav";
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
import "./css-ui.css";

const SECTION_LABELS: Record<Section, string> = {
  all: ".all",
  games: ".games",
  portfolios: ".portfolios",
  saas: ".saas",
  "css-ui": ".css-ui",
  misc: ".misc",
};

const OPEN_ICON = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg>;

/** One of the design's six drawn demos, picked by the post id, until the piece has a screenshot. */
function Demo({ post }: { post: Post }) {
  switch (seedOf(post.id) % 6) {
    case 0:
      return <div className="ub"><span className="b1">Primary</span><span className="b2">Secondary</span><span className="b3">Tertiary</span></div>;
    case 1:
      return <div className="ug"><i style={{ gridColumn: '1 / span 2', gridRow: '1 / span 2', background: '#101b33' }} /><i style={{ background: '#dba40c' }} /><i style={{ background: '#9db4f0' }} /><i style={{ gridColumn: '3 / span 2', background: '#7d89a8' }} /><i style={{ gridColumn: '1 / span 3', background: '#e6eaf3', border: '1.5px solid #c3cadb' }} /><i style={{ background: '#dba40c' }} /></div>;
    case 2:
      return <div className="ut"><div><span className="sw on"><i /></span><span>Notifications</span></div><div><span className="sw"><i /></span><span>Dark mode</span></div></div>;
    case 3:
      return <div className="uy"><span className="aa">Aa</span><div><span>step-3 · 48px</span><span>step-2 · 32px</span><span>step-1 · 24px</span><span>step-0 · 16px</span></div></div>;
    case 4:
      return <div className="ul"><div className="bars"><i style={{ height: '24px' }} /><i className="y" style={{ height: '44px' }} /><i style={{ height: '56px' }} /><i className="y" style={{ height: '36px' }} /><i style={{ height: '20px' }} /></div><span>loading…</span></div>;
    default:
      return <div className="us"><i style={{ left: '24px', top: '0', background: '#9db4f0' }} /><i style={{ left: '12px', top: '12px', background: '#dba40c' }} /><i style={{ left: '0', top: '24px', background: '#fff' }}><b style={{ width: '70%' }} /><b style={{ width: '50%', background: '#9aa5c0' }} /></i></div>;
  }
}

function Shot({ post }: { post: Post }) {
  const cover = coverUrl(post);
  // eslint-disable-next-line @next/next/no-img-element -- media can sit on any https host
  return cover ? <img className="cover-img" src={cover} alt="" /> : <Demo post={post} />;
}

const by = (post: Post) =>
  post.author ? <>by <Link href={profileHref(post.author.username)}>{post.author.displayName}</Link></> : "by a former member";

function PieceCard({ post, onVisit }: { post: Post; onVisit: (id: string) => void }) {
  return (
    <article className="ucard">
      <div className={coverUrl(post) ? "udemo has-img" : "udemo"} role="img" aria-label={`Preview of ${post.caption}`}><Shot post={post} /></div>
      <div className="ubody">
        <div className="utop">
          <div><h3><Link className="title-link" href={postHref(post)}>{post.caption}</Link></h3><span className="by">{by(post)}</span></div>
          {post.skills[0] && <span className="utag">{post.skills[0].name}</span>}
        </div>
        <div className="uact">
          {post.repoUrl ? (
            <a className="code-link" href={post.repoUrl} target="_blank" rel="noopener noreferrer nofollow ugc">View code</a>
          ) : (
            <Link className="code-link" href={postHref(post)}>Details</Link>
          )}
          <a href={post.link} target="_blank" rel="noopener noreferrer nofollow ugc" aria-label={`Open ${post.caption}`} onClick={() => onVisit(post.id)}>{OPEN_ICON}</a>
        </div>
      </div>
    </article>
  );
}

/** The best-rated piece (the newest while nothing is rated), in the hero. */
function TopPiece() {
  const top = usePostList({ kind: "all" }, { category: "css_ui", sort: "top" }, { pageSize: 1 });
  const post = top.posts[0];
  if (!post) {
    return (
      <div className="lotw">
        <div className="lotw-top"><b>Nothing here yet</b><span>be the first</span></div>
        <pre>{"/* Built a layout, effect or component?\n   Post it and it shows up here. */"}</pre>
        <div className="lotw-cta"><Link href="/post/new">Post a piece</Link></div>
      </div>
    );
  }
  return (
    <div className="lotw">
      <div className="lotw-top"><b><Link className="title-link" href={postHref(post)}>{post.ratingCount ? "Top rated" : "Newest"}: {post.caption}</Link></b><span>{post.author ? `by ${post.author.displayName}` : ""}</span></div>
      <div className={coverUrl(post) ? "lotw-demo has-img" : "lotw-demo"} role="img" aria-label={`Preview of ${post.caption}`}>
        {coverUrl(post) ? <Shot post={post} /> : <>
          <div className="a"><i style={{ flex: '1', background: '#101b33' }} /><i style={{ flex: '2', background: '#dba40c' }} /><i style={{ flex: '1', background: '#7d89a8' }} /></div>
          <div className="b"><i style={{ flex: '1', background: '#9db4f0' }} /><div className="c"><i style={{ background: '#101b33' }} /><i style={{ background: '#fff', border: '1.5px solid #c3cadb' }} /></div></div>
        </>}
      </div>
      <pre>{`/* ${firstLine(post.description, 160)} */`}</pre>
    </div>
  );
}

// From design/CssUi.html, with real posts in the CSS & UI section. The type tabs became the section's most used
// skills; "Copy CSS" waits for posts to carry their code, so "View code" opens the repository instead.
export function CssUiPage() {
  const [tab, setTab] = useState(ALL);
  const tabs = useSkillTabs("css_ui");
  const list = usePostList({ kind: "all" }, { category: "css_ui", sort: "new", skill: skillFilter(tab) });
  const visit = useVisit();

  return (
    <>
      <Header />
      <main className="wrap">
        <SectionNav current="css-ui" labels={SECTION_LABELS} />
          <section className="chero">
            <div className="chero-l">
              <span className="comment">{"/* layouts, motion and components, built by hand */"}</span>
              <h1>CSS <span>&amp;</span> UI</h1>
              <p>Small, sharp front-end work you can see, poke and learn from. Open the live piece or read its code.</p>
              <div className="frow">
                <FollowButton className="follow" on="Following" off="Follow CSS &amp; UI" hint={{ on: "Shows first on your home feed.", off: "Follow to see it first on your home feed." }} />
              </div>
            </div>
            <TopPiece />
          </section>
          <div className="bar">
            {tabs.length > 1 ? <Tabs label="Built with" options={tabs} value={tab} onChange={setTab} /> : <span />}
            <span id="count" aria-live="polite">{list.isPending ? "" : plural(list.total, "piece", "pieces")}</span>
          </div>
          {list.posts.length > 0 && (
            <section className="cgrid" aria-label="Pieces">
              {list.posts.map((post) => <PieceCard key={post.id} post={post} onVisit={visit} />)}
            </section>
          )}
          <ListStatus list={list} className="empty" empty={tab === ALL ? <>{"/* nothing here yet */"} <Link href="/post/new">Post the first piece</Link></> : "/* nothing built with this yet */"} />
          <MoreButton list={list} label="Show more pieces" />
      </main>
    </>
  );
}
