"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FollowButton } from "@/components/follow-button";
import { UserFollowButton } from "@/features/follows/components/user-follow-button";
import { useRatingsContext } from "@/features/ratings/ratings-context";
import { formatDate, isoDay } from "@/lib/dates";
import { hostOf, profileHref } from "../paths";
import { CATEGORY_LABELS } from "../post-form";
import type { Post } from "../types";

/** Creator (with a real follow button), Visit live site, View the code, Share and the facts list. */
export function SideCard({ post, onVisit, demo = false }: { post: Post; onVisit: () => void; demo?: boolean }) {
  const { average, count } = useRatingsContext().summary;
  const [shareLabel, setShareLabel] = useState("Share");
  const shareTimer = useRef<number | undefined>(undefined);
  const author = post.author;
  const host = hostOf(post.link);

  useEffect(() => () => window.clearTimeout(shareTimer.current), []);

  function shareDone(label: string) {
    setShareLabel(label);
    window.clearTimeout(shareTimer.current);
    shareTimer.current = window.setTimeout(() => setShareLabel("Share"), 1600);
  }

  function share() {
    // Called inside the click handler so the browser treats it as a user gesture.
    if (!navigator.clipboard?.writeText) return shareDone("Copy failed");
    navigator.clipboard.writeText(location.href).then(() => shareDone("Link copied"), () => shareDone("Copy failed"));
  }

  return (
    <aside className="side" aria-label="About this post">
      <div className="card sidecard">
        {author && (
          <div className="creator">
            <Link className="av" href={profileHref(author.username)} aria-label={`${author.displayName}'s profile`} tabIndex={-1}>
              {/* eslint-disable-next-line @next/next/no-img-element -- avatars can sit on any https host */}
              {author.avatarUrl && <img className="cover-img" src={author.avatarUrl} alt="" />}
            </Link>
            <div className="cname"><Link href={profileHref(author.username)}>{author.displayName}</Link><span>@{author.username}</span></div>
            {demo ? (
              <FollowButton className="follow" on="Following" off="Follow" />
            ) : (
              <UserFollowButton className="follow" userId={author.id} username={author.username} />
            )}
          </div>
        )}
        <a className="visit" href={post.link} target="_blank" rel="noopener noreferrer nofollow ugc" onClick={onVisit}>Visit live site <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg></a>
        <p className="host">Opens {host} in a new tab</p>
        {post.repoUrl && (
          <a className="code" href={post.repoUrl} target="_blank" rel="noopener noreferrer nofollow ugc"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5" /></svg> View the code</a>
        )}
        <div className="acts one">
          <button type="button" className="act" onClick={share}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg> <span aria-live="polite">{shareLabel}</span></button>
        </div>
        <dl className="facts">
          <dt>Category</dt><dd>{CATEGORY_LABELS[post.category]}</dd>
          <dt>Rating</dt><dd>{count ? <><span>{(Math.round(average * 10) / 10).toFixed(1)}</span> from <span>{count}</span></> : "No ratings yet"}</dd>
          <dt>Visits</dt><dd>{post.visitCount.toLocaleString("en-US")}</dd>
          <dt>Posted</dt><dd><time dateTime={isoDay(post.createdAt)}>{formatDate(post.createdAt)}</time></dd>
          <dt>Updated</dt><dd><time dateTime={isoDay(post.updatedAt)}>{formatDate(post.updatedAt)}</time></dd>
        </dl>
      </div>
    </aside>
  );
}
