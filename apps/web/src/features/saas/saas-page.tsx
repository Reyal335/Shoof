"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FollowButton } from "@/components/follow-button";
import { Header } from "@/components/header";
import { SectionNav, type Section } from "@/components/section-nav";
import { ListStatus, MoreButton } from "@/features/posts/components/list-states";
import { RatingChip } from "@/components/rating/rating-chip";
import { usePostList } from "@/features/posts/hooks/use-post-list";
import { ALL, skillFilter, useSkillTabs } from "@/features/posts/hooks/use-skill-tabs";
import { useVisit } from "@/features/posts/hooks/use-visit";
import { coverUrl, postHref, profileHref } from "@/features/posts/paths";
import type { Post } from "@/features/posts/types";
import { chartBars, pick, seedOf } from "@/lib/stand-ins";
import { firstLine } from "@/lib/text";
import { plural } from "@/lib/plural";
import "./saas.css";

const SECTION_LABELS: Record<Section, string> = {
  all: "all-sites",
  games: "games",
  portfolios: "portfolios",
  saas: "saas",
  "css-ui": "css-ui",
  misc: "misc",
};

const LOGO_COLORS = ["#1b3a8a", "#b78500", "#101b33", "#157a70", "#c2414b", "#5b6a92", "#3b4f86"];
const LOGO_SHAPES = ["circle", "square", "diamond"];
const SIDE_COLORS = ["#101b33", "#1b3a8a", "#26335c"];

/** A just-launched product's screenshot, or a drawn dashboard. */
function LaunchShot({ post }: { post: Post }) {
  const cover = coverUrl(post);
  const seed = seedOf(post.id);
  return (
    <div className="lshot" role="img" aria-label={`Preview of ${post.caption}`}>
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element -- media can sit on any https host
        <img className="cover-img" src={cover} alt="" />
      ) : (
        <>
          <div className="side" style={{ background: pick(seed, SIDE_COLORS) }}><i className="sq" /><i /><i /></div>
          <div className="main"><div className="tiles"><i /><i /></div><div className="chart">{chartBars(seed, 8, 20, 64).map((h, i) => <i key={i} style={{ height: `${h}px` }} />)}</div></div>
        </>
      )}
    </div>
  );
}

/** The three newest products. */
function JustLaunched({ onVisit }: { onVisit: (id: string) => void }) {
  const latest = usePostList({ kind: "all" }, { category: "saas", sort: "new" }, { pageSize: 3 });
  if (!latest.posts.length) return null;
  return (
    <section className="launch" aria-label="Just launched">
      <div className="lh"><i /><h2>Just launched</h2><span>{plural(latest.posts.length, "product", "products")}</span></div>
      <div className="lgrid">
        {latest.posts.map((post) => (
          <article className="lcard" key={post.id}>
            <LaunchShot post={post} />
            <div className="lbody">
              <div className="lrow"><div><h3><Link className="title-link" href={postHref(post)}>{post.caption}</Link></h3><span className="tg">{firstLine(post.description, 90)}</span></div></div>
              <a className="try" href={post.link} target="_blank" rel="noopener noreferrer nofollow ugc" aria-label={`Try ${post.caption}`} onClick={() => onVisit(post.id)}>Try it ↗</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductRow({ post, rank }: { post: Post; rank: number }) {
  const seed = seedOf(post.id);
  return (
    <div className="prod">
      <span className="rk">{rank}</span>
      <div className="logo" style={{ background: pick(seed, LOGO_COLORS) }} aria-hidden="true"><i className={pick(seed >> 3, LOGO_SHAPES)} /></div>
      <div className="pinfo">
        <div className="ptop"><Link href={postHref(post)}>{post.caption}</Link><span>{firstLine(post.description, 80)}</span></div>
        <div className="pmeta">
          {post.author ? <Link className="cat" href={profileHref(post.author.username)}>{post.author.displayName}</Link> : <span className="cat">Former member</span>}
          {post.skills.length > 0 && <><span className="dotsep">·</span><span className="stk">{post.skills.slice(0, 3).map((skill) => <span key={skill.id}>{skill.name}</span>)}</span></>}
        </div>
      </div>
      <RatingChip value={post.rating} count={post.ratingCount} />
    </div>
  );
}

// From design/Saas.html, with real posts in the SaaS section ranked by rating. Upvotes became ratings (Shoof's
// one score), the category panel became the section's most used skills, and the pricing filter waits for products
// to carry a price.
export function SaasPage() {
  const [tab, setTab] = useState(ALL);
  const tabs = useSkillTabs("saas", { limit: 8 });
  const list = usePostList({ kind: "all" }, { category: "saas", sort: "top", skill: skillFilter(tab) }, { pageSize: 15 });
  const visit = useVisit();

  return (
    <>
      <Header />
      <main className="wrap">
        <SectionNav current="saas" labels={SECTION_LABELS} />
        <section className="hero">
          <div>
            <h1>SaaS &amp; products</h1>
            <p>Tools people built and launched. Try them, rate the ones you would pay for, and tell the maker what you think.</p>
          </div>
          <div className="frow">
            <FollowButton className="follow" on="Following" off="Follow SaaS" hint={{ on: "Launches show first on your home feed.", off: "Follow to see launches first." }} hintFirst />
          </div>
        </section>
        <JustLaunched onVisit={visit} />
        <div className="sbody">
          <section className="list" aria-label="Products">
            <div className="list-top">
              <b>Top rated</b>
              <span id="count" aria-live="polite">{list.isPending ? "" : plural(list.total, "product", "products")}</span>
            </div>
            {list.posts.map((post, i) => <ProductRow key={post.id} post={post} rank={i + 1} />)}
            <ListStatus list={list} className="empty" empty={tab === ALL ? <>No products yet. <Link href="/post/new">Launch the first one</Link>.</> : "No products built with this yet."} />
            <MoreButton list={list} label="Show more products" />
          </section>
          <aside className="side2">
            {tabs.length > 1 && (
              <section className="panel" aria-label="Built with">
                <h2>Built with</h2>
                {tabs.map((option) => (
                  <button key={option.value} type="button" className="cat-btn" aria-pressed={tab === option.value} onClick={() => setTab(option.value)}>
                    {option.value === ALL ? "Any stack" : option.label}
                  </button>
                ))}
              </section>
            )}
            <section className="cta">
              <Image src="/shoof-blob.svg" alt="" width={48} height={47} />
              <h2>Launching something?</h2>
              <p>Post it with a live link and your stack. New products show up under Just launched.</p>
              <Link href="/post/new">Submit a product</Link>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
