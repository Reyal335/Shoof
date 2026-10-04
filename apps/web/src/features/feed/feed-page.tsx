"use client";

import Link from "next/link";
import { cloneElement, useState } from "react";
import { Header } from "@/components/header";
import { dataOf, type Card } from "@/lib/cards";
import { plural } from "@/lib/plural";
import "./feed.css";

const STACKS = ["React", "TypeScript", "Node.js", "Vue", "Next.js", "Tailwind", "HTML & CSS"];

function LikeButton({ label, likes }: { label: string; likes: number }) {
  const [liked, setLiked] = useState(false);
  return (
    <button type="button" className="like" aria-pressed={liked} aria-label={label} data-likes={likes} onClick={() => setLiked(!liked)}>
      <svg width="20" height="20" viewBox="0 0 24 24" stroke="#101b33" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M12 20s-8-4.7-8-10.5A4.5 4.5 0 0112 7a4.5 4.5 0 018 2.5C20 15.3 12 20 12 20z" /></svg>
      <span className="count">{likes + (liked ? 1 : 0)}</span>
    </button>
  );
}

export function FeedPage() {
  // One stack chip at a time; pressing the pressed chip clears the filter.
  const [stack, setStack] = useState<string | null>(null);
  const isVisible = (card: Card) => !stack || dataOf(card, "stack").split("|").includes(stack);
  const count = cards.filter(isVisible).length;

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
          <div className="stacks">
            <span className="label">Stack</span>
            {STACKS.map((value) => (
              <button key={value} type="button" className="stack" aria-pressed={stack === value} data-stack={value} onClick={() => setStack(stack === value ? null : value)}>
                {value}
              </button>
            ))}
          </div>
        </div>
        <article className="featured" id="featured" hidden={stack !== null}>
          <div className="feat-shot" role="img" aria-label="Screenshot of the featured site">
            <div className="dots"><i style={{ background: '#ef6f6f' }} /><i style={{ background: '#dba40c' }} /><i style={{ background: '#4fd1a5' }} /><span className="url">[yourgame].example.com</span></div>
            <div className="feat-game"><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c1" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /></div>
          </div>
          <div className="feat-info">
            <span className="feat-tag">Featured today</span>
            <h2>[Project name]</h2>
            <p>A browser game built from scratch. Describe what it does and what you learned making it, in a sentence or two.</p>
            <div className="chips"><span className="chip">TypeScript</span><span className="chip">Phaser</span><span className="chip">Vite</span></div>
            <div className="feat-by"><span className="avatar" /><b style={{ fontSize: '15px' }}>[Creator]</b><span>with 2 collaborators</span></div>
            <div className="feat-btns">
              <a className="btn-dark" href="#visit">Visit live site <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg></a>
              <a className="btn-line" href="#details">Details</a>
            </div>
          </div>
        </article>
        <div className="bar">
          <span id="count" aria-live="polite">{plural(count, "site", "sites")}</span>
          <div className="sort"><span className="on">Trending</span><span>New</span><span>Following</span></div>
        </div>
        <section className="grid" id="grid" aria-label="Sites">
          {cards.map((card) => cloneElement(card, { hidden: !isVisible(card) }))}
        </section>
        <div className="empty" id="empty" hidden={count !== 0}>No sites match these filters yet. Clear a filter or post the first one.</div>
      </main>
    </>
  );
}

// The site cards, written out as in design/Feed.html. Filtering reads data-stack.
const cards: Card[] = [
  <article key="1" className="card" data-category="Games" data-stack="TypeScript|Phaser|Vite">
    <div className="preview" role="img" aria-label="Screenshot of Browser game">
      <div className="pv game"><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /></div>
      <span className="badge">Games</span>
      <a className="visit" href="#visit" aria-label="Visit Browser game"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#101b33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg></a>
    </div>
    <div className="card-body">
      <div>
        <h3>[Project name]</h3>
        <p>A browser game. One line on what it is and how you play.</p>
      </div>
      <div className="chips"><span className="chip">TypeScript</span><span className="chip">Phaser</span><span className="chip">Vite</span></div>
      <div className="card-foot">
        <div className="creator"><span className="avatar" /><span className="cname">[Creator]</span><span className="collabs"><span className="mini" style={{ background: '#dba40c' }} /><span className="mini" style={{ background: '#6b7ba8' }} /></span></div>
        <LikeButton label="Like [Project name]" likes={128} />
      </div>
    </div>
  </article>,
  <article key="2" className="card" data-category="Portfolios" data-stack="Next.js|Tailwind|React">
    <div className="preview" role="img" aria-label="Screenshot of Portfolio">
      <div className="pv portfolio"><div className="pf-nav"><i className="pf-logo" /><span><i /><i /><i /></span></div><div className="pf-hero"><div className="pf-text"><b style={{ width: '92%' }} /><b style={{ width: '66%' }} /><em /></div><div className="pf-dot" /></div><div className="pf-row"><i /><i /><i /></div></div>
      <span className="badge">Portfolios</span>
      <a className="visit" href="#visit" aria-label="Visit Portfolio"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#101b33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg></a>
    </div>
    <div className="card-body">
      <div>
        <h3>[Project name]</h3>
        <p>Personal portfolio with case studies and a contact form.</p>
      </div>
      <div className="chips"><span className="chip">Next.js</span><span className="chip">Tailwind</span><span className="chip">React</span></div>
      <div className="card-foot">
        <div className="creator"><span className="avatar" /><span className="cname">[Creator]</span><span className="collabs" /></div>
        <LikeButton label="Like [Project name]" likes={74} />
      </div>
    </div>
  </article>,
  <article key="3" className="card" data-category="CSS &amp; UI" data-stack="HTML &amp; CSS">
    <div className="preview" role="img" aria-label="Screenshot of CSS layout study">
      <div className="pv css"><div className="row1"><i style={{ flex: '1', background: '#101b33' }} /><i style={{ flex: '2', background: '#dba40c' }} /><i style={{ flex: '1', background: '#7d89a8' }} /></div><div className="row2"><i style={{ flex: '1', background: '#9db4f0' }} /><div className="col"><i style={{ background: '#101b33' }} /><i style={{ background: '#fff' }} /></div></div></div>
      <span className="badge">CSS &amp; UI</span>
      <a className="visit" href="#visit" aria-label="Visit CSS layout study"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#101b33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg></a>
    </div>
    <div className="card-body">
      <div>
        <h3>[Project name]</h3>
        <p>A layout study built with flex and grid, no JavaScript.</p>
      </div>
      <div className="chips"><span className="chip">HTML &amp; CSS</span></div>
      <div className="card-foot">
        <div className="creator"><span className="avatar" /><span className="cname">[Creator]</span><span className="collabs"><span className="mini" style={{ background: '#3b4f86' }} /></span></div>
        <LikeButton label="Like [Project name]" likes={203} />
      </div>
    </div>
  </article>,
  <article key="4" className="card" data-category="SaaS" data-stack="React|Node.js|PostgreSQL">
    <div className="preview" role="img" aria-label="Screenshot of SaaS dashboard">
      <div className="pv saas"><div className="side"><i className="sq" /><i /><i /><i /></div><div className="main"><div className="tiles"><i /><i /><i /></div><div className="chart"><i style={{ height: '32px' }} /><i style={{ height: '50px' }} /><i style={{ height: '38px' }} /><i style={{ height: '64px' }} /><i style={{ height: '53px' }} /><i style={{ height: '74px' }} /><i style={{ height: '59px' }} /><i style={{ height: '46px' }} /><i style={{ height: '69px' }} /><i style={{ height: '56px' }} /></div></div></div>
      <span className="badge">SaaS</span>
      <a className="visit" href="#visit" aria-label="Visit SaaS dashboard"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#101b33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg></a>
    </div>
    <div className="card-body">
      <div>
        <h3>[Project name]</h3>
        <p>A tool that solves one problem well. Say who it is for.</p>
      </div>
      <div className="chips"><span className="chip">React</span><span className="chip">Node.js</span><span className="chip">PostgreSQL</span></div>
      <div className="card-foot">
        <div className="creator"><span className="avatar" /><span className="cname">[Creator]</span><span className="collabs"><span className="mini" style={{ background: '#dba40c' }} /><span className="mini" style={{ background: '#3b4f86' }} /><span className="mini" style={{ background: '#6b7ba8' }} /></span></div>
        <LikeButton label="Like [Project name]" likes={311} />
      </div>
    </div>
  </article>,
  <article key="5" className="card" data-category="Games" data-stack="React|TypeScript">
    <div className="preview" role="img" aria-label="Screenshot of Puzzle game">
      <div className="pv game"><span className="c2" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /></div>
      <span className="badge">Games</span>
      <a className="visit" href="#visit" aria-label="Visit Puzzle game"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#101b33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg></a>
    </div>
    <div className="card-body">
      <div>
        <h3>[Project name]</h3>
        <p>A small puzzle game made in a weekend for a game jam.</p>
      </div>
      <div className="chips"><span className="chip">React</span><span className="chip">TypeScript</span></div>
      <div className="card-foot">
        <div className="creator"><span className="avatar" /><span className="cname">[Creator]</span><span className="collabs" /></div>
        <LikeButton label="Like [Project name]" likes={59} />
      </div>
    </div>
  </article>,
  <article key="6" className="card" data-category="Portfolios" data-stack="Vue|Tailwind">
    <div className="preview" role="img" aria-label="Screenshot of Illustrator portfolio">
      <div className="pv portfolio"><div className="pf-nav"><i className="pf-logo" /><span><i /><i /><i /></span></div><div className="pf-hero"><div className="pf-text"><b style={{ width: '92%' }} /><b style={{ width: '66%' }} /><em /></div><div className="pf-dot" /></div><div className="pf-row"><i /><i /><i /></div></div>
      <span className="badge">Portfolios</span>
      <a className="visit" href="#visit" aria-label="Visit Illustrator portfolio"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#101b33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg></a>
    </div>
    <div className="card-body">
      <div>
        <h3>[Project name]</h3>
        <p>Illustrator portfolio with a fast image gallery.</p>
      </div>
      <div className="chips"><span className="chip">Vue</span><span className="chip">Tailwind</span></div>
      <div className="card-foot">
        <div className="creator"><span className="avatar" /><span className="cname">[Creator]</span><span className="collabs"><span className="mini" style={{ background: '#6b7ba8' }} /></span></div>
        <LikeButton label="Like [Project name]" likes={96} />
      </div>
    </div>
  </article>,
  <article key="7" className="card" data-category="SaaS" data-stack="Vue|Node.js|TypeScript">
    <div className="preview" role="img" aria-label="Screenshot of Tracking dashboard">
      <div className="pv saas"><div className="side"><i className="sq" /><i /><i /><i /></div><div className="main"><div className="tiles"><i /><i /><i /></div><div className="chart"><i style={{ height: '56px' }} /><i style={{ height: '43px' }} /><i style={{ height: '66px' }} /><i style={{ height: '48px' }} /><i style={{ height: '72px' }} /><i style={{ height: '61px' }} /><i style={{ height: '40px' }} /><i style={{ height: '54px' }} /><i style={{ height: '67px' }} /><i style={{ height: '77px' }} /></div></div></div>
      <span className="badge">SaaS</span>
      <a className="visit" href="#visit" aria-label="Visit Tracking dashboard"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#101b33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg></a>
    </div>
    <div className="card-body">
      <div>
        <h3>[Project name]</h3>
        <p>Dashboard for tracking something people actually need to track.</p>
      </div>
      <div className="chips"><span className="chip">Vue</span><span className="chip">Node.js</span><span className="chip">TypeScript</span></div>
      <div className="card-foot">
        <div className="creator"><span className="avatar" /><span className="cname">[Creator]</span><span className="collabs"><span className="mini" style={{ background: '#3b4f86' }} /></span></div>
        <LikeButton label="Like [Project name]" likes={142} />
      </div>
    </div>
  </article>,
  <article key="8" className="card" data-category="CSS &amp; UI" data-stack="HTML &amp; CSS|TypeScript">
    <div className="preview" role="img" aria-label="Screenshot of Animated components">
      <div className="pv css"><div className="row1"><i style={{ flex: '1', background: '#101b33' }} /><i style={{ flex: '2', background: '#dba40c' }} /><i style={{ flex: '1', background: '#7d89a8' }} /></div><div className="row2"><i style={{ flex: '1', background: '#9db4f0' }} /><div className="col"><i style={{ background: '#101b33' }} /><i style={{ background: '#fff' }} /></div></div></div>
      <span className="badge">CSS &amp; UI</span>
      <a className="visit" href="#visit" aria-label="Visit Animated components"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#101b33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg></a>
    </div>
    <div className="card-body">
      <div>
        <h3>[Project name]</h3>
        <p>Animated components collection with copy-paste snippets.</p>
      </div>
      <div className="chips"><span className="chip">HTML &amp; CSS</span><span className="chip">TypeScript</span></div>
      <div className="card-foot">
        <div className="creator"><span className="avatar" /><span className="cname">[Creator]</span><span className="collabs" /></div>
        <LikeButton label="Like [Project name]" likes={187} />
      </div>
    </div>
  </article>
];
