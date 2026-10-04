"use client";

import { cloneElement, useState } from "react";
import { FollowButton } from "@/components/follow-button";
import { Header } from "@/components/header";
import { Tabs } from "@/components/tabs";
import { dataOf, type Card } from "@/lib/cards";
import { plural } from "@/lib/plural";
import "./creators.css";

const ROLES = ["All", "Game dev", "Frontend", "Full-stack", "Design"].map((value) => ({ value, label: value }));

type Sort = "followers" | "newest" | "sites";
const SORT_BY: Record<Sort, string> = { followers: "followers", newest: "order", sites: "sites" };

export function CreatorsPage() {
  const [role, setRole] = useState("All");
  const [openOnly, setOpenOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("followers");

  const isVisible = (card: Card) =>
    (role === "All" || dataOf(card, "group") === role) && (!openOnly || dataOf(card, "open") === "true");
  const count = cards.filter(isVisible).length;
  const sorted = [...cards].sort((a, b) => Number(dataOf(b, SORT_BY[sort])) - Number(dataOf(a, SORT_BY[sort])));

  return (
    <>
      <Header current="creators" />
      <main className="wrap">
        <div className="intro">
          <h1>The people behind the sites.</h1>
          <p>Find creators by what they build, what they use and who they want to build with.</p>
        </div>
        <section className="cfeat" aria-label="Creator of the week">
          <div className="cfeat-info">
            <span className="tag">Creator of the week</span>
            <div className="who">
              <div className="big-av" />
              <div><h2>[Creator name]</h2><span>@handle · Full-stack developer</span></div>
            </div>
            <p>Short bio about what this creator builds and why their work stood out this week.</p>
            <div className="dchips"><span>React</span><span>Node.js</span><span>TypeScript</span></div>
            <div className="stats">
              <div><b>12</b><span>Sites</span></div><div><b>1.2k</b><span>Followers</span></div><div><b>5</b><span>Collaborators</span></div>
            </div>
            <div className="cfeat-btns">
              <FollowButton className="btn-follow" on="Following" off="Follow" />
              <a className="btn-ghost" href="#profile">View profile</a>
            </div>
          </div>
          <div className="cfeat-pv">
            <div className="pv-saas" role="img" aria-label="Preview of a SaaS dashboard">
              <div className="side"><i className="sq" /><i /><i /></div>
              <div className="main"><div className="tiles"><i /><i /></div><div className="chart"><i style={{ height: '52px' }} /><i style={{ height: '81px' }} /><i style={{ height: '62px' }} /><i style={{ height: '104px' }} /><i style={{ height: '86px' }} /><i style={{ height: '120px' }} /><i style={{ height: '96px' }} /><i style={{ height: '75px' }} /><i style={{ height: '112px' }} /></div></div>
            </div>
            <div className="pv-pf" role="img" aria-label="Preview of a portfolio"><i className="l1" /><div className="r"><div className="t"><b style={{ width: '90%' }} /><b style={{ width: '60%' }} /></div><i className="dot" /></div></div>
            <div className="pv-game cells" role="img" aria-label="Preview of a browser game"><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c1" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /></div>
          </div>
        </section>
        <div className="toolbar">
          <div className="toolbar-row">
            <Tabs label="Creator type" options={ROLES} value={role} onChange={setRole} />
            <label className="check"><input type="checkbox" id="open" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} /> Open to collaborate</label>
          </div>
          <div className="toolbar-row">
            <span id="count" aria-live="polite">{plural(count, "creator", "creators")}</span>
            <div className="sort" role="group" aria-label="Sort creators">
              <button type="button" data-sort="followers" aria-pressed={sort === "followers"} onClick={() => setSort("followers")}>Most followed</button>
              <button type="button" data-sort="newest" aria-pressed={sort === "newest"} onClick={() => setSort("newest")}>Newest</button>
              <button type="button" data-sort="sites" aria-pressed={sort === "sites"} onClick={() => setSort("sites")}>Most sites</button>
            </div>
          </div>
        </div>
        <section className="cgrid" id="cgrid" aria-label="Creators">
          {sorted.map((card) => cloneElement(card, { hidden: !isVisible(card) }))}
        </section>
        <div className="empty" id="empty" hidden={count !== 0}>No creators match these filters yet.</div>
      </main>
    </>
  );
}

// The creator cards, written out as in design/Creators.html. Filtering reads data-group and data-open;
// sorting reads data-followers, data-order and data-sites.
const cards: Card[] = [
  <article key="1" className="ccard" data-group="Game dev" data-open="true" data-followers="860" data-sites="9" data-order="10">
    <div className="cprev"><div className="mp mp-game cells"><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c1" /><span className="c0" /></div><div className="mp mp-game cells"><span className="c2" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /></div><div className="mp mp-css"><div className="a"><i style={{ flex: '1', background: '#101b33' }} /><i style={{ flex: '2', background: '#dba40c' }} /></div><div className="b"><i style={{ flex: '1', background: '#9db4f0' }} /><i style={{ flex: '2', background: '#fff' }} /></div></div><span className="open-tag">Open to collaborate</span></div>
    <div className="cbody">
      <div className="crow"><div className="av" style={{ background: '#dba40c' }} /><FollowButton className="fbtn" on="Following" off="Follow" /></div>
      <div className="cname"><a href="#profile">[Creator name]</a><span>@handle · Game developer</span></div>
      <p>Builds small browser games and writes down what went wrong in each one.</p>
      <div className="chips"><span className="chip">TypeScript</span><span className="chip">Phaser</span><span className="chip">Vite</span></div>
      <div className="cfoot"><span><b>9</b> sites · <b>860</b> followers</span><div className="collabs" aria-label="2 collaborators"><i style={{ background: '#3b4f86' }} /><i style={{ background: '#6b7ba8' }} /></div></div>
    </div>
  </article>,
  <article key="2" className="ccard" data-group="Full-stack" data-open="false" data-followers="1400" data-sites="6" data-order="9">
    <div className="cprev"><div className="mp mp-saas"><div className="s"><i className="sq" /><i /></div><div className="m"><i style={{ height: '28px' }} /><i style={{ height: '45px' }} /><i style={{ height: '34px' }} /><i style={{ height: '53px' }} /><i style={{ height: '41px' }} /><i style={{ height: '59px' }} /></div></div><div className="mp mp-saas"><div className="s"><i className="sq" /><i /></div><div className="m"><i style={{ height: '28px' }} /><i style={{ height: '45px' }} /><i style={{ height: '34px' }} /><i style={{ height: '53px' }} /><i style={{ height: '41px' }} /><i style={{ height: '59px' }} /></div></div><div className="mp mp-pf"><i className="l1" /><div className="r"><div className="t"><b style={{ width: '90%' }} /><b style={{ width: '60%' }} /></div><i className="dot" /></div></div></div>
    <div className="cbody">
      <div className="crow"><div className="av" style={{ background: '#3b4f86' }} /><FollowButton className="fbtn" on="Following" off="Follow" /></div>
      <div className="cname"><a href="#profile">[Creator name]</a><span>@handle · Full-stack developer</span></div>
      <p>Ships tools for small teams. Likes boring tech that works.</p>
      <div className="chips"><span className="chip">React</span><span className="chip">Node.js</span><span className="chip">PostgreSQL</span></div>
      <div className="cfoot"><span><b>6</b> sites · <b>1.4k</b> followers</span><div className="collabs" aria-label="1 collaborators"><i style={{ background: '#dba40c' }} /></div></div>
    </div>
  </article>,
  <article key="3" className="ccard" data-group="Frontend" data-open="true" data-followers="2100" data-sites="14" data-order="8">
    <div className="cprev"><div className="mp mp-css"><div className="a"><i style={{ flex: '1', background: '#101b33' }} /><i style={{ flex: '2', background: '#dba40c' }} /></div><div className="b"><i style={{ flex: '1', background: '#9db4f0' }} /><i style={{ flex: '2', background: '#fff' }} /></div></div><div className="mp mp-css"><div className="a"><i style={{ flex: '1', background: '#101b33' }} /><i style={{ flex: '2', background: '#dba40c' }} /></div><div className="b"><i style={{ flex: '1', background: '#9db4f0' }} /><i style={{ flex: '2', background: '#fff' }} /></div></div><div className="mp mp-pf"><i className="l1" /><div className="r"><div className="t"><b style={{ width: '90%' }} /><b style={{ width: '60%' }} /></div><i className="dot" /></div></div><span className="open-tag">Open to collaborate</span></div>
    <div className="cbody">
      <div className="crow"><div className="av" style={{ background: '#6b7ba8' }} /><FollowButton className="fbtn" on="Following" off="Follow" /></div>
      <div className="cname"><a href="#profile">[Creator name]</a><span>@handle · Frontend developer</span></div>
      <p>Layouts, motion and the small details in between.</p>
      <div className="chips"><span className="chip">HTML &amp; CSS</span><span className="chip">Vue</span><span className="chip">Tailwind</span></div>
      <div className="cfoot"><span><b>14</b> sites · <b>2.1k</b> followers</span><div className="collabs" aria-label="3 collaborators"><i style={{ background: '#101b33' }} /><i style={{ background: '#dba40c' }} /><i style={{ background: '#3b4f86' }} /></div></div>
    </div>
  </article>,
  <article key="4" className="ccard" data-group="Design" data-open="true" data-followers="980" data-sites="7" data-order="7">
    <div className="cprev"><div className="mp mp-pf"><i className="l1" /><div className="r"><div className="t"><b style={{ width: '90%' }} /><b style={{ width: '60%' }} /></div><i className="dot" /></div></div><div className="mp mp-css"><div className="a"><i style={{ flex: '1', background: '#101b33' }} /><i style={{ flex: '2', background: '#dba40c' }} /></div><div className="b"><i style={{ flex: '1', background: '#9db4f0' }} /><i style={{ flex: '2', background: '#fff' }} /></div></div><div className="mp mp-saas"><div className="s"><i className="sq" /><i /></div><div className="m"><i style={{ height: '28px' }} /><i style={{ height: '45px' }} /><i style={{ height: '34px' }} /><i style={{ height: '53px' }} /><i style={{ height: '41px' }} /><i style={{ height: '59px' }} /></div></div><span className="open-tag">Open to collaborate</span></div>
    <div className="cbody">
      <div className="crow"><div className="av" style={{ background: '#101b33' }} /><FollowButton className="fbtn" on="Following" off="Follow" /></div>
      <div className="cname"><a href="#profile">[Creator name]</a><span>@handle · UI designer</span></div>
      <p>Designs interfaces and builds them to see if they hold up.</p>
      <div className="chips"><span className="chip">Figma</span><span className="chip">Next.js</span><span className="chip">Tailwind</span></div>
      <div className="cfoot"><span><b>7</b> sites · <b>980</b> followers</span><div className="collabs" aria-label="1 collaborators"><i style={{ background: '#6b7ba8' }} /></div></div>
    </div>
  </article>,
  <article key="5" className="ccard" data-group="Full-stack" data-open="false" data-followers="520" data-sites="4" data-order="6">
    <div className="cprev"><div className="mp mp-saas"><div className="s"><i className="sq" /><i /></div><div className="m"><i style={{ height: '28px' }} /><i style={{ height: '45px' }} /><i style={{ height: '34px' }} /><i style={{ height: '53px' }} /><i style={{ height: '41px' }} /><i style={{ height: '59px' }} /></div></div><div className="mp mp-pf"><i className="l1" /><div className="r"><div className="t"><b style={{ width: '90%' }} /><b style={{ width: '60%' }} /></div><i className="dot" /></div></div><div className="mp mp-saas"><div className="s"><i className="sq" /><i /></div><div className="m"><i style={{ height: '28px' }} /><i style={{ height: '45px' }} /><i style={{ height: '34px' }} /><i style={{ height: '53px' }} /><i style={{ height: '41px' }} /><i style={{ height: '59px' }} /></div></div></div>
    <div className="cbody">
      <div className="crow"><div className="av" style={{ background: '#dba40c' }} /><FollowButton className="fbtn" on="Following" off="Follow" /></div>
      <div className="cname"><a href="#profile">[Creator name]</a><span>@handle · Indie maker</span></div>
      <p>One product at a time, built in public from a spare room.</p>
      <div className="chips"><span className="chip">Next.js</span><span className="chip">TypeScript</span><span className="chip">MongoDB</span></div>
      <div className="cfoot"><span><b>4</b> sites · <b>520</b> followers</span><div className="collabs" aria-label="0 collaborators" /></div>
    </div>
  </article>,
  <article key="6" className="ccard" data-group="Frontend" data-open="true" data-followers="1700" data-sites="11" data-order="5">
    <div className="cprev"><div className="mp mp-game cells"><span className="c2" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /></div><div className="mp mp-css"><div className="a"><i style={{ flex: '1', background: '#101b33' }} /><i style={{ flex: '2', background: '#dba40c' }} /></div><div className="b"><i style={{ flex: '1', background: '#9db4f0' }} /><i style={{ flex: '2', background: '#fff' }} /></div></div><div className="mp mp-game cells"><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c1" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /></div><span className="open-tag">Open to collaborate</span></div>
    <div className="cbody">
      <div className="crow"><div className="av" style={{ background: '#3b4f86' }} /><FollowButton className="fbtn" on="Following" off="Follow" /></div>
      <div className="cname"><a href="#profile">[Creator name]</a><span>@handle · Creative coder</span></div>
      <p>Generative art and odd little experiments that run in the browser.</p>
      <div className="chips"><span className="chip">JavaScript</span><span className="chip">Canvas</span><span className="chip">Three.js</span></div>
      <div className="cfoot"><span><b>11</b> sites · <b>1.7k</b> followers</span><div className="collabs" aria-label="2 collaborators"><i style={{ background: '#dba40c' }} /><i style={{ background: '#6b7ba8' }} /></div></div>
    </div>
  </article>
];
