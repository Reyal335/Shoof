"use client";

import Image from "next/image";
import { cloneElement, createContext, useContext, useRef, useState } from "react";
import { FollowButton } from "@/components/follow-button";
import { Header } from "@/components/header";
import { SectionNav } from "@/components/section-nav";
import { Tabs } from "@/components/tabs";
import { dataOf, type Card } from "@/lib/cards";
import { plural } from "@/lib/plural";
import "./misc.css";

const KINDS = ["All", "Toys", "Tools", "Experiments", "Generative art", "Extensions", "AI demos"].map((value) => ({
  value,
  label: value,
}));

// Whether the card around a <PickedTag /> is the one "Shoof me something" picked.
const PickContext = createContext(false);

function PickedTag() {
  return (
    <span className="ptag" hidden={!useContext(PickContext)}>
      Picked for you
    </span>
  );
}

export function MiscPage() {
  const [kind, setKind] = useState("All");
  const [pickedKey, setPickedKey] = useState<string | null>(null);
  const gridRef = useRef<HTMLElement>(null);

  const isVisible = (card: Card) => kind === "All" || dataOf(card, "kind") === kind;
  const visible = cards.filter(isVisible);
  const count = visible.length;
  const picked = cards.find((card) => card.key === pickedKey);

  const selectKind = (value: string) => {
    setKind(value);
    setPickedKey(null);
  };

  // First press picks the third visible card, later presses jump three ahead, wrapping round.
  const shoofMe = () => {
    if (!visible.length) return;
    const i = visible.findIndex((card) => card.key === pickedKey);
    const next = visible[i < 0 ? 2 % visible.length : (i + 3) % visible.length];
    setPickedKey(next.key);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gridRef.current?.children[cards.indexOf(next)]?.scrollIntoView({
      block: "nearest",
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

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
              <button type="button" className="shoofme" id="shoofme" onClick={shoofMe}>Shoof me something</button>
              <FollowButton className="follow" on="Following" off="Follow Misc" />
              <span id="pick" role="status">{picked ? `Try the ${dataOf(picked, "kind").toLowerCase()} one.` : ""}</span>
            </div>
          </div>
        </section>
        <div className="bar">
          <Tabs label="Kind" options={KINDS} value={kind} onChange={selectKind} />
          <span id="count" aria-live="polite">{plural(count, "thing", "things")}</span>
        </div>
        <section className="mgrid" aria-label="Projects" ref={gridRef}>
          {cards.map((card) => (
            <PickContext key={card.key} value={card.key === pickedKey}>
              {cloneElement(card, {
                hidden: !isVisible(card),
                className: card.key === pickedKey ? `${card.props.className} picked` : card.props.className,
              })}
            </PickContext>
          ))}
        </section>
        <p className="empty" id="empty" hidden={count !== 0}>Nothing weird enough yet. Post something.</p>
      </main>
    </>
  );
}

// The project cards, written out as in design/Misc.html. Filtering reads data-kind.
const cards: Card[] = [
  <article key="1" className="mcard wide" data-kind="Generative art">
    <div className="mshot" role="img" aria-label="Preview of [Project name]"><div className="m-gen"><i style={{ width: '48px', height: '48px', background: '#dba40c' }} /><i style={{ width: '22px', height: '22px', background: '#9db4f0' }} /><i style={{ width: '34px', height: '34px', background: '#ef6f6f' }} /><i style={{ width: '60px', height: '60px', background: '#2ec4b6' }} /><i style={{ width: '18px', height: '18px', background: '#eef1f8' }} /><i style={{ width: '40px', height: '40px', background: '#dba40c' }} /><i style={{ width: '26px', height: '26px', background: '#9db4f0' }} /><i style={{ width: '52px', height: '52px', background: '#ef6f6f' }} /><i style={{ width: '30px', height: '30px', background: '#2ec4b6' }} /><i style={{ width: '20px', height: '20px', background: '#eef1f8' }} /><i style={{ width: '44px', height: '44px', background: '#dba40c' }} /><i style={{ width: '28px', height: '28px', background: '#9db4f0' }} /><i style={{ width: '36px', height: '36px', background: '#ef6f6f' }} /><i style={{ width: '24px', height: '24px', background: '#2ec4b6' }} /></div><PickedTag /></div>
    <div className="mbody">
      <span className="kind">Generative art</span>
      <h3>[Project name]</h3>
      <p>A new pattern every time you load the page. Click to freeze one.</p>
      <div className="mfoot"><span>by [Creator]</span><a className="try" href="#open">Try it ↗</a></div>
    </div>
  </article>,
  <article key="2" className="mcard" data-kind="Tools">
    <div className="mshot" role="img" aria-label="Preview of [Project name]"><div className="m-tool"><div className="in">paste something here</div><div className="ar"><b>↓</b><i /></div><div className="out"><i style={{ width: '80%', background: '#eef1f8' }} /><i style={{ width: '56%', background: '#9db4f0' }} /></div></div><PickedTag /></div>
    <div className="mbody">
      <span className="kind">Tools</span>
      <h3>[Project name]</h3>
      <p>Paste messy text, get a clean table back.</p>
      <div className="mfoot"><span>by [Creator]</span><a className="try" href="#open">Try it ↗</a></div>
    </div>
  </article>,
  <article key="3" className="mcard" data-kind="Extensions">
    <div className="mshot" role="img" aria-label="Preview of [Project name]"><div className="m-ext"><div className="tb"><i className="u" /><i className="a" /><i className="y" /></div><div className="pop"><div><i style={{ width: '60px', background: '#101b33' }} /><i className="sw" style={{ background: '#101b33' }} /></div><div><i style={{ width: '72px', background: '#9aa5c0' }} /><i className="sw" style={{ background: '#c3cadb' }} /></div></div></div><PickedTag /></div>
    <div className="mbody">
      <span className="kind">Extensions</span>
      <h3>[Project name]</h3>
      <p>A browser extension that hides what distracts you.</p>
      <div className="mfoot"><span>by [Creator]</span><a className="try" href="#open">Try it ↗</a></div>
    </div>
  </article>,
  <article key="4" className="mcard" data-kind="AI demos">
    <div className="mshot" role="img" aria-label="Preview of [Project name]"><div className="m-ai"><div className="usr"><i style={{ width: '120px' }} /><i style={{ width: '80px' }} /></div><div className="bot"><i style={{ width: '140px' }} /><i style={{ width: '100px', background: '#9aa5c0' }} /></div><div className="typing"><i /><i style={{ background: '#5b6a92' }} /><i style={{ background: '#9aa5c0' }} /></div></div><PickedTag /></div>
    <div className="mbody">
      <span className="kind">AI demos</span>
      <h3>[Project name]</h3>
      <p>Talk to a recipe book that only knows soup.</p>
      <div className="mfoot"><span>by [Creator]</span><a className="try" href="#open">Try it ↗</a></div>
    </div>
  </article>,
  <article key="5" className="mcard" data-kind="Toys">
    <div className="mshot" role="img" aria-label="Preview of [Project name]"><div className="m-toy"><span className="btn">PRESS</span><span className="ct">pressed [1,204] times</span></div><PickedTag /></div>
    <div className="mbody">
      <span className="kind">Toys</span>
      <h3>[Project name]</h3>
      <p>One button. Everyone on the site presses the same one.</p>
      <div className="mfoot"><span>by [Creator]</span><a className="try" href="#open">Try it ↗</a></div>
    </div>
  </article>,
  <article key="6" className="mcard wide" data-kind="Experiments">
    <div className="mshot" role="img" aria-label="Preview of [Project name]"><div className="m-exp"><span>SCROLL</span><span className="o">SCROLL</span><span style={{ paddingLeft: '60px' }}>SCROLL</span></div><PickedTag /></div>
    <div className="mbody">
      <span className="kind">Experiments</span>
      <h3>[Project name]</h3>
      <p>A page that changes its typography as you scroll.</p>
      <div className="mfoot"><span>by [Creator]</span><a className="try" href="#open">Try it ↗</a></div>
    </div>
  </article>,
  <article key="7" className="mcard" data-kind="Tools">
    <div className="mshot" role="img" aria-label="Preview of [Project name]"><div className="m-tool"><div className="in">paste something here</div><div className="ar"><b>↓</b><i /></div><div className="out"><i style={{ width: '80%', background: '#eef1f8' }} /><i style={{ width: '56%', background: '#9db4f0' }} /></div></div><PickedTag /></div>
    <div className="mbody">
      <span className="kind">Tools</span>
      <h3>[Project name]</h3>
      <p>Turn a long URL into a QR code you can print.</p>
      <div className="mfoot"><span>by [Creator]</span><a className="try" href="#open">Try it ↗</a></div>
    </div>
  </article>
];
