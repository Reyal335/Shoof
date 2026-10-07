"use client";

import Image from "next/image";
import { useState } from "react";
import { FollowButton } from "@/components/follow-button";
import { Header } from "@/components/header";
import { Tabs } from "@/components/tabs";
import "./profile.css";

const SECTIONS = [
  { value: "sites", label: "Sites" },
  { value: "about", label: "About" },
  { value: "saved", label: "Saved" },
];

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg>
  );
}

// Static mock from design/Profile.html: nothing here is loaded or saved yet.
export function ProfilePage() {
  const [section, setSection] = useState("sites");
  const [following, setFollowing] = useState(false);

  return (
    <>
      <Header current="profile" />
      <main className="wrap">
        <section className="hero" aria-label="Profile">
          <div className="banner"><Image src="/shoof-blob.svg" alt="" width={150} height={148} /></div>
          <div className="headrow">
            <div className="who">
              <div className="avatar" role="img" aria-label="Profile photo placeholder"></div>
              <div className="names">
                <h1>[Creator name]</h1>
                <span className="meta">@handle · Full-stack developer · [City, Country]</span>
              </div>
              <p className="bio">Short bio: what you build, what you are learning and what kind of projects you want to work on next.</p>
              <div className="links">
                <a href="#website">yourname.dev</a>
                <a href="#github">GitHub</a>
                <a href="#linkedin">LinkedIn</a>
              </div>
            </div>
            <div className="side">
              <div className="btns">
                <FollowButton className="follow" on="Following" off="Follow" following={following} onFollowingChange={setFollowing} />
                <button className="msg" type="button">Message</button>
              </div>
              <span className="open">Open to collaborate</span>
              <ul className="stats" aria-label="Profile stats">
                <li><b>8</b><span>Sites</span></li>
                <li><b>{following ? 241 : 240}</b><span>Followers</span></li>
                <li><b>132</b><span>Following</span></li>
              </ul>
            </div>
          </div>
        </section>
        <div className="pcols">
          <section className="main" aria-label="Profile content">
            <Tabs label="Profile sections" options={SECTIONS} value={section} onChange={setSection} panels />
            <div role="tabpanel" id="panel-sites" aria-labelledby="tab-sites" hidden={section !== "sites"}>
              <div className="sitegrid">
                <article className="card">
                  <div className="shot" role="img" aria-label="Screenshot of [Project name], a SaaS product">
                    <div className="saas"><div className="nav"><i /><i /><i /></div><div className="body"><div className="k"><i /><i /><i /></div><div className="chart"><i style={{ height: '28px' }} /><i style={{ height: '43px' }} /><i style={{ height: '34px' }} /><i style={{ height: '56px' }} /><i style={{ height: '46px' }} /><i style={{ height: '64px' }} /><i style={{ height: '52px' }} /><i style={{ height: '41px' }} /><i style={{ height: '60px' }} /><i style={{ height: '49px' }} /></div></div></div>
                    <span className="tag">SaaS</span>
                    <a className="go" href="#visit" aria-label="Visit [Project name] (a SaaS product)"><Arrow /></a>
                  </div>
                  <div className="lbody">
                    <h3>[Project name]</h3>
                    <p>A tool that solves one problem well.</p>
                    <div className="chips"><span>React</span><span>Node.js</span><span>PostgreSQL</span></div>
                  </div>
                </article>
                <article className="card">
                  <div className="shot" role="img" aria-label="Screenshot of [Project name], a game">
                    <div className="game"><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c1" /><span className="c1" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c1" /><span className="c0" /><span className="c1" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c0" /><span className="c0" /><span className="c2" /><span className="c1" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /><span className="c0" /><span className="c3" /><span className="c0" /><span className="c0" /></div>
                    <span className="tag">Games</span>
                    <a className="go" href="#visit" aria-label="Visit [Project name] (a game)"><Arrow /></a>
                  </div>
                  <div className="lbody">
                    <h3>[Project name]</h3>
                    <p>A browser game made for a game jam.</p>
                    <div className="chips"><span>TypeScript</span><span>Phaser</span></div>
                  </div>
                </article>
                <article className="card">
                  <div className="shot" role="img" aria-label="Screenshot of [Project name], a portfolio">
                    <div className="port">
                      <div className="r"><i style={{ width: '54px', height: '8px', background: '#101b33' }} /><div style={{ display: 'flex', gap: '10px' }}><i /><i /></div></div>
                      <div className="mid"><div className="ln"><i style={{ width: '92%' }} /><i style={{ width: '66%' }} /><i style={{ width: '54px', height: '22px', borderRadius: '11px', background: '#dba40c', marginTop: '8px' }} /></div><div style={{ width: '88px', height: '88px', borderRadius: '50%', background: '#dba40c', flexShrink: 0 }} /></div>
                      <div className="row3"><i /><i /><i /></div>
                    </div>
                    <span className="tag">Portfolios</span>
                    <a className="go" href="#visit" aria-label="Visit [Project name] (a portfolio)"><Arrow /></a>
                  </div>
                  <div className="lbody">
                    <h3>[Project name]</h3>
                    <p>Personal portfolio with case studies.</p>
                    <div className="chips"><span>Next.js</span><span>Tailwind</span></div>
                  </div>
                </article>
                <article className="card">
                  <div className="shot" role="img" aria-label="Screenshot of [Project name], a CSS and UI piece">
                    <div className="css">
                      <div className="a"><i style={{ flexGrow: 1, background: '#101b33' }} /><i style={{ flexGrow: 2, background: '#dba40c' }} /><i style={{ flexGrow: 1, background: '#7d89a8' }} /></div>
                      <div className="b"><i style={{ flexGrow: 1, background: '#9db4f0' }} /><div><i style={{ flexGrow: 1, background: '#101b33' }} /><i style={{ flexGrow: 1, background: '#fff' }} /></div></div>
                    </div>
                    <span className="tag">CSS &amp; UI</span>
                    <a className="go" href="#visit" aria-label="Visit [Project name] (a CSS and UI piece)"><Arrow /></a>
                  </div>
                  <div className="lbody">
                    <h3>[Project name]</h3>
                    <p>A layout study built with flex and grid.</p>
                    <div className="chips"><span>HTML &amp; CSS</span></div>
                  </div>
                </article>
              </div>
            </div>
            <div role="tabpanel" id="panel-about" aria-labelledby="tab-about" hidden={section !== "about"}>
              <div className="panel">
                <h2>About</h2>
                <p>Longer write-up in the creator&apos;s own words: how they got into building for the web, what they like making and what they are looking for.</p>
              </div>
            </div>
            <div role="tabpanel" id="panel-saved" aria-labelledby="tab-saved" hidden={section !== "saved"}>
              <div className="panel empty">Sites this creator has saved will show here.</div>
            </div>
          </section>
          <aside aria-label="Tech stack">
            <section className="stack">
              <h2>Tech stack</h2>
              <div className="grp"><h3>Frontend</h3><div><span>React</span><span>TypeScript</span><span>Tailwind</span><span>Next.js</span></div></div>
              <div className="grp"><h3>Backend</h3><div><span>Node.js</span><span>Express</span><span>MongoDB</span><span>PostgreSQL</span></div></div>
              <div className="grp"><h3>Tools</h3><div><span>Docker</span><span>Git</span><span>Vite</span></div></div>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
