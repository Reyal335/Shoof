"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/header";
import { Tabs } from "@/components/tabs";
import { EditProfileDialog } from "./components/edit-profile-dialog";
import { ProfileSites } from "./components/profile-sites";
import { ProfileStats } from "./components/profile-stats";
import { useMyProfile } from "./hooks/use-my-profile";
import { groupByKind, KIND_LABELS } from "@/features/skills/skills";
import { displayHost } from "./profile-form";
import type { Profile } from "./types";
import "./profile.css";

const SECTIONS = [
  { value: "sites", label: "Sites" },
  { value: "about", label: "About" },
  { value: "saved", label: "Saved" },
];

// The signed-in user's own profile, from design/Profile.html. Everything is loaded from the API: the header, bio and
// tech stack (editable), the numbers and the sites. Saving sites (bookmarks) doesn't exist yet.
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
  const stack = groupByKind(profile.skills);

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
              <span className="meta"><Link href={`/@${profile.username}`}>@{profile.username}</Link></span>
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
            <ProfileStats username={profile.username} />
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
            <ProfileSites
              username={profile.username}
              empty={<>You haven&apos;t posted a site yet. <Link href="/post/new">Post your first one</Link>.</>}
            />
          </div>
          <div role="tabpanel" id="panel-about" aria-labelledby="tab-about" hidden={section !== "about"}>
            <div className="panel">
              <h2>About</h2>
              {profile.bio ? (
                <p>{profile.bio}</p>
              ) : (
                <p>
                  Nothing here yet.{" "}
                  <button type="button" className="linkbtn" onClick={() => setEditing(true)}>Add a bio</button>
                </p>
              )}
            </div>
          </div>
          <div role="tabpanel" id="panel-saved" aria-labelledby="tab-saved" hidden={section !== "saved"}>
            <div className="panel empty">Saving sites is coming soon. The ones you save will show here.</div>
          </div>
        </section>
        <aside aria-label="Tech stack">
          <section className="stack">
            <h2>Tech stack</h2>
            {stack.length > 0 ? (
              stack.map(({ kind, skills }) => (
                <div className="grp" key={kind}>
                  <h3>{KIND_LABELS[kind]}</h3>
                  <div>{skills.map((skill) => <span key={skill.id}>{skill.name}</span>)}</div>
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
