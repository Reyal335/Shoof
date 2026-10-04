"use client";

import { cloneElement, useEffect, useState } from "react";
import { FollowButton } from "@/components/follow-button";
import { Header } from "@/components/header";
import { SectionNav, type Section } from "@/components/section-nav";
import { Tabs } from "@/components/tabs";
import { dataOf, type Card } from "@/lib/cards";
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

const TAGS = ["All", "Layout", "Animation", "Components", "Typography", "3D"].map((value) => ({ value, label: value }));

/** A piece's hidden code block plus its View code / Copy CSS / open actions. */
function CodeActions({ name, code }: { name: string; code: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    const done = () => setCopied(true);
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(code).then(done, done);
    else done();
  };

  return (
    <>
      <pre hidden={!open}>{code}</pre>
      <div className="uact">
        <button type="button" className="code" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? "Hide code" : "View code"}
        </button>
        <button type="button" className="copy" onClick={copy}>
          {copied ? "Copied" : "Copy CSS"}
        </button>
        <a href="#open" aria-label={`Open ${name}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg>
        </a>
      </div>
    </>
  );
}

export function CssUiPage() {
  const [tag, setTag] = useState("All");
  const isVisible = (card: Card) => tag === "All" || dataOf(card, "tag") === tag;
  const count = cards.filter(isVisible).length;

  return (
    <>
      <Header />
      <main className="wrap">
        <SectionNav current="css-ui" labels={SECTION_LABELS} />
          <section className="chero">
            <div className="chero-l">
              <span className="comment">{"/* layouts, motion and components, built by hand */"}</span>
              <h1>CSS <span>&amp;</span> UI</h1>
              <p>Small, sharp front-end work you can see, poke and copy. Every piece shows its code.</p>
              <div className="frow">
                <FollowButton className="follow" on="Following" off="Follow CSS &amp; UI" hint={{ on: "Shows first on your home feed.", off: "Follow to see it first on your home feed." }} />
              </div>
            </div>
            <div className="lotw">
              <div className="lotw-top"><b>Layout of the week</b><span>by [Creator]</span></div>
              <div className="lotw-demo" role="img" aria-label="Demo of a flex layout">
                <div className="a"><i style={{ flex: '1', background: '#101b33' }} /><i style={{ flex: '2', background: '#dba40c' }} /><i style={{ flex: '1', background: '#7d89a8' }} /></div>
                <div className="b"><i style={{ flex: '1', background: '#9db4f0' }} /><div className="c"><i style={{ background: '#101b33' }} /><i style={{ background: '#fff', border: '1.5px solid #c3cadb' }} /></div></div>
              </div>
        <pre>{".layout {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.row > :nth-child(2) { flex: 2; }"}</pre>
            </div>
          </section>
          <div className="bar">
            <Tabs label="Type" options={TAGS} value={tag} onChange={setTag} />
            <span id="count" aria-live="polite">{plural(count, "piece", "pieces")}</span>
          </div>
          <section className="cgrid" aria-label="Pieces">
            {cards.map((card) => cloneElement(card, { hidden: !isVisible(card) }))}
          </section>
          <p className="empty" id="empty" hidden={count !== 0}>{"/* nothing here yet */"}</p>
      </main>
    </>
  );
}

// The pieces, written out as in design/CssUi.html. Filtering reads data-tag.
const cards: Card[] = [
  <article key="1" className="ucard" data-tag="Components">
    <div className="udemo" role="img" aria-label="Demo of Button set"><div className="ub"><span className="b1">Primary</span><span className="b2">Secondary</span><span className="b3">Tertiary</span></div></div>
    <div className="ubody">
      <div className="utop"><div><h3>Button set</h3><span className="by">by [Creator]</span></div><span className="utag">Components</span></div>
      <CodeActions name="Button set" code={".btn {\n  padding: 12px 20px;\n  border-radius: 999px;\n  font-weight: 700;\n}"} />
    </div>
  </article>,
  <article key="2" className="ucard" data-tag="Layout">
    <div className="udemo" role="img" aria-label="Demo of Bento grid"><div className="ug"><i style={{ gridColumn: '1 / span 2', gridRow: '1 / span 2', background: '#101b33' }} /><i style={{ background: '#dba40c' }} /><i style={{ background: '#9db4f0' }} /><i style={{ gridColumn: '3 / span 2', background: '#7d89a8' }} /><i style={{ gridColumn: '1 / span 3', background: '#e6eaf3', border: '1.5px solid #c3cadb' }} /><i style={{ background: '#dba40c' }} /></div></div>
    <div className="ubody">
      <div className="utop"><div><h3>Bento grid</h3><span className="by">by [Creator]</span></div><span className="utag">Layout</span></div>
      <CodeActions name="Bento grid" code={".bento {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 8px;\n}"} />
    </div>
  </article>,
  <article key="3" className="ucard" data-tag="Components">
    <div className="udemo" role="img" aria-label="Demo of Toggle switch"><div className="ut"><div><span className="sw on"><i /></span><span>Notifications</span></div><div><span className="sw"><i /></span><span>Dark mode</span></div></div></div>
    <div className="ubody">
      <div className="utop"><div><h3>Toggle switch</h3><span className="by">by [Creator]</span></div><span className="utag">Components</span></div>
      <CodeActions name="Toggle switch" code={".switch {\n  width: 56px; height: 32px;\n  border-radius: 16px;\n  transition: background .2s;\n}"} />
    </div>
  </article>,
  <article key="4" className="ucard" data-tag="Typography">
    <div className="udemo" role="img" aria-label="Demo of Fluid type scale"><div className="uy"><span className="aa">Aa</span><div><span>step-3 · 48px</span><span>step-2 · 32px</span><span>step-1 · 24px</span><span>step-0 · 16px</span></div></div></div>
    <div className="ubody">
      <div className="utop"><div><h3>Fluid type scale</h3><span className="by">by [Creator]</span></div><span className="utag">Typography</span></div>
      <CodeActions name="Fluid type scale" code={":root {\n  --step-0: clamp(1rem, 2vw, 1.125rem);\n  --step-1: clamp(1.5rem, 3vw, 2rem);\n}"} />
    </div>
  </article>,
  <article key="5" className="ucard" data-tag="Animation">
    <div className="udemo" role="img" aria-label="Demo of Bouncing bars"><div className="ul"><div className="bars"><i style={{ height: '24px' }} /><i className="y" style={{ height: '44px' }} /><i style={{ height: '56px' }} /><i className="y" style={{ height: '36px' }} /><i style={{ height: '20px' }} /></div><span>loading…</span></div></div>
    <div className="ubody">
      <div className="utop"><div><h3>Bouncing bars</h3><span className="by">by [Creator]</span></div><span className="utag">Animation</span></div>
      <CodeActions name="Bouncing bars" code={".bar {\n  animation: bounce 1s infinite;\n  animation-delay: calc(var(--i) * .1s);\n}"} />
    </div>
  </article>,
  <article key="6" className="ucard" data-tag="3D">
    <div className="udemo" role="img" aria-label="Demo of Card stack"><div className="us"><i style={{ left: '24px', top: '0', background: '#9db4f0' }} /><i style={{ left: '12px', top: '12px', background: '#dba40c' }} /><i style={{ left: '0', top: '24px', background: '#fff' }}><b style={{ width: '70%' }} /><b style={{ width: '50%', background: '#9aa5c0' }} /></i></div></div>
    <div className="ubody">
      <div className="utop"><div><h3>Card stack</h3><span className="by">by [Creator]</span></div><span className="utag">3D</span></div>
      <CodeActions name="Card stack" code={".card {\n  transform: translate(\n    calc(var(--n) * 12px),\n    calc(var(--n) * -12px));\n}"} />
    </div>
  </article>
];
