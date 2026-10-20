import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { UserFollowButton } from "@/features/follows/components/user-follow-button";
import type { Page, Post } from "@/features/posts/types";
import { groupByKind, KIND_LABELS } from "@/features/skills/skills";
import { ProfileSites } from "./components/profile-sites";
import { ProfileStats } from "./components/profile-stats";
import { displayHost, isSiteUrl } from "./profile-form";
import type { FollowCounts, PublicUser } from "./types";
import "./profile.css";

type Props = {
  user: PublicUser;
  /** The server's first page of sites and follow numbers. Missing ones load in the browser. */
  sites?: Page<Post>;
  counts?: FollowCounts;
};

// Anyone's profile at /@username. A Server Component: the profile, numbers and first sites are in the first HTML
// response; the follow button, numbers and site list hydrate so they can update.
export function PublicProfilePage({ user, sites, counts }: Props) {
  const profile = user.profile;
  const name = profile?.displayName || user.username;
  const stack = groupByKind(user.skills);
  // Only http(s): these are user-supplied and end up in href.
  const links = (profile?.links ?? []).filter((link) => isSiteUrl(link.url));

  return (
    <>
      <Header />
      <main className="wrap">
        <section className="hero" aria-label="Profile">
          <div className="banner"><Image src="/shoof-blob.svg" alt="" width={150} height={148} /></div>
          <div className="headrow">
            <div className="who">
              {profile?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- any https host is allowed, so next/image's remotePatterns can't list them
                <img className="avatar" src={profile.avatarUrl} alt={`${name}'s profile photo`} />
              ) : (
                <div className="avatar" role="img" aria-label="Default profile photo"></div>
              )}
              <div className="names">
                <h1>{name}</h1>
                <span className="meta">@{user.username}</span>
              </div>
              {profile?.bio && <p className="bio">{profile.bio}</p>}
              {(profile?.websiteUrl || links.length > 0) && (
                <div className="links">
                  {profile?.websiteUrl && isSiteUrl(profile.websiteUrl) && (
                    <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer nofollow ugc">{displayHost(profile.websiteUrl)}</a>
                  )}
                  {links.map((link) => (
                    <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer nofollow ugc">{link.label || displayHost(link.url)}</a>
                  ))}
                </div>
              )}
            </div>
            <div className="side">
              <div className="btns">
                <UserFollowButton className="follow" userId={user.id} username={user.username} />
              </div>
              <ProfileStats username={user.username} initialSites={sites} initialCounts={counts} />
            </div>
          </div>
        </section>
        <div className="pcols">
          <section className="main" aria-label="Sites">
            <ProfileSites
              username={user.username}
              initialPage={sites}
              empty={<>{name} hasn&apos;t posted a site yet. <Link href="/">See what others are shipping</Link>.</>}
            />
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
                <p className="none">Nothing listed yet.</p>
              )}
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
