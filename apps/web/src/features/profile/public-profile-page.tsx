import Image from "next/image";
import { Header } from "@/components/header";
import { UserFollowButton } from "@/features/follows/components/user-follow-button";
import { displayHost, GROUP_LABELS, isSiteUrl } from "./profile-form";
import { TECH_STACK_GROUPS, type PublicUser } from "./types";
import "./profile.css";

// Anyone's profile at /@username. A Server Component: everything is in the first HTML response, and only the follow
// button hydrates. Same layout as the owner's ProfilePage, minus editing and the static mock sites and stats.
export function PublicProfilePage({ user }: { user: PublicUser }) {
  const profile = user.profile;
  const name = profile?.displayName || user.username;
  const techStack = profile?.techStack;
  const stack = TECH_STACK_GROUPS.filter((group) => (techStack?.[group].length ?? 0) > 0);
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
            </div>
          </div>
        </section>
        <div className="pcols">
          <section className="main" aria-label="Sites">
            <div className="panel empty">Sites {name} has shared will show here.</div>
          </section>
          <aside aria-label="Tech stack">
            <section className="stack">
              <h2>Tech stack</h2>
              {stack.length > 0 ? (
                stack.map((group) => (
                  <div className="grp" key={group}>
                    <h3>{GROUP_LABELS[group]}</h3>
                    <div>{techStack?.[group].map((tech) => <span key={tech}>{tech}</span>)}</div>
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
