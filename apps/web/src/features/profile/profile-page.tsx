"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/header";
import { Tabs } from "@/components/tabs";
import { EditProfileDialog } from "./components/edit-profile-dialog";
import { useMyProfile } from "./hooks/use-my-profile";
import { displayHost, GROUP_LABELS } from "./profile-form";
import { TECH_STACK_GROUPS, type Profile } from "./types";
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

// The signed-in user's own profile, from design/Profile.html. The header, bio and tech stack are loaded and editable;
// the sites, stats and tabs below are still the static mock.
export function ProfilePage() {
  const { state, reload, replace } = useMyProfile();

  return (
    <>
      <Header current="profile" />
      <main className="wrap">
        {state.status === "ready" ? (
          <ProfileContent profile={state.profile} onSaved={replace} />
        ) : (
          <div className="panel empty" role="status" aria-live="polite">
            {state.status === "loading" && "Loading your profile…"}
            {state.status === "signed-out" && (
              <>
                <Link href="/login?next=/profile">Log in</Link> to see and edit your profile.
              </>
            )}
            {state.status === "error" && (
              <>
                We couldn&apos;t load your profile.{" "}
                <button type="button" className="linkbtn" onClick={reload}>Try again</button>
              </>
            )}
          </div>
        )}
      </main>
    </>
  );
}

function ProfileContent({ profile, onSaved }: { profile: Profile; onSaved: (profile: Profile) => void }) {
  const [section, setSection] = useState("sites");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState("");
  const hasStack = TECH_STACK_GROUPS.some((group) => profile.techStack[group].length > 0);

  return (
    <>
      <section className="hero" aria-label="Profile">
        <div className="banner"><Image src="/shoof-blob.svg" alt="" width={150} height={148} /></div>
        <div className="headrow">
          <div className="who">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- any https host is allowed, so next/image's remotePatterns can't list them
              <img className="avatar" src={profile.avatarUrl} alt={`${profile.displayName}'s profile photo`} />
            ) : (
              <div className="avatar" role="img" aria-label="Default profile photo"></div>
            )}
            <div className="names">
              <h1>{profile.displayName}</h1>
              <span className="meta">@{profile.username}</span>
            </div>
            {profile.bio ? (
              <p className="bio">{profile.bio}</p>
            ) : (
              <p className="bio none">No bio yet. Tell people what you build.</p>
            )}
            {profile.websiteUrl && (
              <div className="links">
                <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer nofollow ugc">{displayHost(profile.websiteUrl)}</a>
              </div>
            )}
          </div>
          <div className="side">
            <div className="btns">
              <button className="follow" type="button" onClick={() => setEditing(true)}>Edit profile</button>
            </div>
            <span className="open">Open to collaborate</span>
            <ul className="stats" aria-label="Profile stats">
              <li><b>8</b><span>Sites</span></li>
              <li><b>240</b><span>Followers</span></li>
              <li><b>132</b><span>Following</span></li>
            </ul>
          </div>
        </div>
      </section>
      <p className="sr" role="status" aria-live="polite">{saved}</p>
      <EditProfileDialog
        profile={profile}
        open={editing}
        onClose={() => setEditing(false)}
        onSaved={(next) => {
          onSaved(next);
          setEditing(false);
          setSaved("Profile saved.");
        }}
      />
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
                  <h3><Link className="title-link" href="/post/demo">[Project name]</Link></h3>
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
                  <h3><Link className="title-link" href="/post/demo">[Project name]</Link></h3>
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
                  <h3><Link className="title-link" href="/post/demo">[Project name]</Link></h3>
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
                  <h3><Link className="title-link" href="/post/demo">[Project name]</Link></h3>
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
            {hasStack ? (
              TECH_STACK_GROUPS.filter((group) => profile.techStack[group].length > 0).map((group) => (
                <div className="grp" key={group}>
                  <h3>{GROUP_LABELS[group]}</h3>
                  <div>{profile.techStack[group].map((name) => <span key={name}>{name}</span>)}</div>
                </div>
              ))
            ) : (
              <p className="none">
                Nothing here yet.{" "}
                <button type="button" className="linkbtn" onClick={() => setEditing(true)}>Add your stack</button>
              </p>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
