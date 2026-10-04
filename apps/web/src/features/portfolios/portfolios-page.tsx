"use client";

import { cloneElement, useState } from "react";
import { FollowButton } from "@/components/follow-button";
import { Header } from "@/components/header";
import { SectionNav } from "@/components/section-nav";
import { Tabs } from "@/components/tabs";
import { dataOf, type Card } from "@/lib/cards";
import "./portfolios.css";

const DISCIPLINES = ["All", "Developers", "Designers", "Illustrators", "Motion", "Writers"].map((value) => ({
  value,
  label: value,
}));

export function PortfoliosPage() {
  const [discipline, setDiscipline] = useState("All");
  const [openOnly, setOpenOnly] = useState(false);
  const isVisible = (card: Card) =>
    (discipline === "All" || dataOf(card, "group") === discipline) && (!openOnly || dataOf(card, "open") === "true");
  const visible = cards.filter(isVisible);
  const count = visible.length;
  // The first visible card becomes the big Spotlight card, but only when there are enough cards to fill around it.
  const spotlight = count > 2 ? visible[0] : null;

  return (
    <>
      <Header />
      <main className="wrap">
        <SectionNav current="portfolios" />
        <section className="phero">
          <h1>Portfolios,<br /><em>worth a closer look.</em></h1>
          <div className="phero-r">
            <p>Personal sites from developers, designers, illustrators and writers. Shown as they are, with who made them and whether they are taking on work.</p>
            <div className="frow">
              <FollowButton className="follow" on="Following" off="Follow Portfolios" hint={{ on: "Portfolios show first on your home feed.", off: "Follow to see portfolios first." }} />
            </div>
          </div>
        </section>
        <div className="bar">
          <Tabs label="Discipline" options={DISCIPLINES} value={discipline} onChange={setDiscipline} />
          <label className="check"><input type="checkbox" id="open" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} /> Open to work only</label>
        </div>
        <section className="pgrid" aria-label="Portfolios">
          {cards.map((card) =>
            cloneElement(card, {
              hidden: !isVisible(card),
              className: card === spotlight ? "pcard big" : "pcard",
            }),
          )}
        </section>
        <p className="empty" id="empty" hidden={count !== 0}>Nothing here yet. Try another discipline.</p>
      </main>
    </>
  );
}

// The portfolio cards, written out as in design/Portfolios.html. Filtering reads data-group and data-open.
const cards: Card[] = [
  <article key="1" className="pcard" data-group="Developers" data-open="true">
    <a className="plink" href="#visit" aria-label="Visit [Name]"><div role="img" aria-label="Screenshot of [Name]'s portfolio" style={{ display: 'flex', flexGrow: '1' }}><div className="sh dark"><div className="r1"><i className="y" /><span><i /><i /></span></div><div className="mid"><b style={{ width: '80%', background: '#eef1f8' }} /><b style={{ width: '56%', background: '#dba40c' }} /><u style={{ width: '70%' }} /><u style={{ width: '50%' }} /></div><div className="r3"><i /><i /><i /></div></div></div></a>
    <div className="pmeta">
      <div><span className="spot">Spotlight</span><h3>[Name]</h3><span className="role">Full-stack developer · [City]</span><span className="opn"><i />Open to work</span></div>
      <a className="visit" href="#visit">Visit ↗</a>
    </div>
  </article>,
  <article key="2" className="pcard" data-group="Designers" data-open="false">
    <a className="plink" href="#visit" aria-label="Visit [Name]"><div role="img" aria-label="Screenshot of [Name]'s portfolio" style={{ display: 'flex', flexGrow: '1' }}><div className="sh light"><div className="r1"><i className="n" /><span><i /><i /></span></div><div className="mid"><div className="t"><b style={{ width: '92%' }} /><b style={{ width: '64%' }} /><em /></div><i className="dot" /></div></div></div></a>
    <div className="pmeta">
      <div><span className="spot">Spotlight</span><h3>[Name]</h3><span className="role">Product designer · [City]</span></div>
      <a className="visit" href="#visit">Visit ↗</a>
    </div>
  </article>,
  <article key="3" className="pcard" data-group="Illustrators" data-open="true">
    <a className="plink" href="#visit" aria-label="Visit [Name]"><div role="img" aria-label="Screenshot of [Name]'s portfolio" style={{ display: 'flex', flexGrow: '1' }}><div className="sh gal"><i className="n" /><div className="g"><i style={{ gridRow: '1 / span 2', background: '#9db4f0' }} /><i style={{ background: '#dba40c' }} /><i style={{ background: '#26335c' }} /><i style={{ background: '#e6eaf3' }} /><i style={{ background: '#7d89a8' }} /></div></div></div></a>
    <div className="pmeta">
      <div><span className="spot">Spotlight</span><h3>[Name]</h3><span className="role">Illustrator · [City]</span><span className="opn"><i />Open to work</span></div>
      <a className="visit" href="#visit">Visit ↗</a>
    </div>
  </article>,
  <article key="4" className="pcard" data-group="Developers" data-open="true">
    <a className="plink" href="#visit" aria-label="Visit [Name]"><div role="img" aria-label="Screenshot of [Name]'s portfolio" style={{ display: 'flex', flexGrow: '1' }}><div className="sh split"><div className="l"><i /></div><div className="r"><b style={{ width: '90%' }} /><b style={{ width: '70%' }} /><u style={{ width: '80%' }} /><u style={{ width: '60%' }} /></div></div></div></a>
    <div className="pmeta">
      <div><span className="spot">Spotlight</span><h3>[Name]</h3><span className="role">Frontend developer · [City]</span><span className="opn"><i />Open to work</span></div>
      <a className="visit" href="#visit">Visit ↗</a>
    </div>
  </article>,
  <article key="5" className="pcard" data-group="Motion" data-open="false">
    <a className="plink" href="#visit" aria-label="Visit [Name]"><div role="img" aria-label="Screenshot of [Name]'s portfolio" style={{ display: 'flex', flexGrow: '1' }}><div className="sh dark"><div className="r1"><i className="y" /><span><i /><i /></span></div><div className="mid"><b style={{ width: '80%', background: '#eef1f8' }} /><b style={{ width: '56%', background: '#dba40c' }} /><u style={{ width: '70%' }} /><u style={{ width: '50%' }} /></div><div className="r3"><i /><i /><i /></div></div></div></a>
    <div className="pmeta">
      <div><span className="spot">Spotlight</span><h3>[Name]</h3><span className="role">Motion designer · [City]</span></div>
      <a className="visit" href="#visit">Visit ↗</a>
    </div>
  </article>,
  <article key="6" className="pcard" data-group="Writers" data-open="true">
    <a className="plink" href="#visit" aria-label="Visit [Name]"><div role="img" aria-label="Screenshot of [Name]'s portfolio" style={{ display: 'flex', flexGrow: '1' }}><div className="sh type"><span>Essays &amp; notes</span><hr /><u style={{ width: '92%' }} /><u style={{ width: '86%' }} /><u style={{ width: '74%' }} /><u style={{ width: '88%' }} /></div></div></a>
    <div className="pmeta">
      <div><span className="spot">Spotlight</span><h3>[Name]</h3><span className="role">Technical writer · [City]</span><span className="opn"><i />Open to work</span></div>
      <a className="visit" href="#visit">Visit ↗</a>
    </div>
  </article>,
  <article key="7" className="pcard" data-group="Designers" data-open="false">
    <a className="plink" href="#visit" aria-label="Visit [Name]"><div role="img" aria-label="Screenshot of [Name]'s portfolio" style={{ display: 'flex', flexGrow: '1' }}><div className="sh gal"><i className="n" /><div className="g"><i style={{ gridRow: '1 / span 2', background: '#9db4f0' }} /><i style={{ background: '#dba40c' }} /><i style={{ background: '#26335c' }} /><i style={{ background: '#e6eaf3' }} /><i style={{ background: '#7d89a8' }} /></div></div></div></a>
    <div className="pmeta">
      <div><span className="spot">Spotlight</span><h3>[Name]</h3><span className="role">Brand designer · [City]</span></div>
      <a className="visit" href="#visit">Visit ↗</a>
    </div>
  </article>
];
