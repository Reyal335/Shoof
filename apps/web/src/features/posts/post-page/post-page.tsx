"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { RatePrompt } from "@/components/rating/rate-prompt";
import { RatingSummary } from "@/components/rating/rating-summary";
import { StarRating } from "@/components/rating/star-rating";
import { RatingsProvider, useRatingsContext } from "@/features/ratings/ratings-context";
import { formatDate, isoDay } from "@/lib/dates";
import { paragraphs } from "@/lib/text";
import { getPost } from "../api";
import { useVisit } from "../hooks/use-visit";
import { CATEGORY_PATHS, hostOf, postHref } from "../paths";
import { CATEGORY_LABELS } from "../post-form";
import { postKeys } from "../queries";
import type { PostDetail } from "../types";
import { Comments } from "./comments";
import { Gallery } from "./gallery";
import { MoreFrom } from "./more-from";
import { SideCard } from "./side-card";
import { PromptThumb } from "./stand-ins";
import "./post.css";

/** Scrolls to the element named by the URL hash (notifications link to #h-comments and #h-ratings), or to the top. */
function useHashScroll() {
  useEffect(() => {
    function scroll() {
      const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
      const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      if (target) target.scrollIntoView({ behavior, block: "start" });
      else if (!location.hash) window.scrollTo(0, 0);
    }
    scroll();
    window.addEventListener("hashchange", scroll);
    return () => window.removeEventListener("hashchange", scroll);
  }, []);
}

type Props = {
  initialPost: PostDetail;
  /** /post/demo: the design's sample post, with mock ratings and no other API calls. */
  demo?: boolean;
};

/**
 * One posted site: gallery, creator, ratings and comments. The server renders it from `initialPost` (so crawlers
 * and link previews get everything); TanStack Query then owns the copy. Ratings live in one RatingsProvider, so the
 * meta line, the facts, the Ratings card and the rate prompt always show the same numbers.
 */
export function PostPage({ initialPost, demo = false }: Props) {
  const { data: post } = useQuery({
    queryKey: postKeys.detail(initialPost.id),
    queryFn: () => getPost(initialPost.id),
    initialData: initialPost,
    enabled: !demo,
  });
  const seed = { average: post.rating, count: post.ratingCount, distribution: post.ratingDistribution };

  return (
    <RatingsProvider postId={post.id} seed={seed}>
      <PostBody post={post} demo={demo} />
    </RatingsProvider>
  );
}

function PostBody({ post, demo }: { post: PostDetail; demo: boolean }) {
  useHashScroll();
  const ratings = useRatingsContext();
  const visit = useVisit();
  const onVisit = () => {
    if (!demo) visit(post.id);
    ratings.markVisited();
  };
  const section = CATEGORY_LABELS[post.category];
  const sectionHref = CATEGORY_PATHS[post.category];
  const here = demo ? `/post/${post.id}` : postHref(post);
  const loginHref = `/login?next=${encodeURIComponent(`${here}#h-ratings`)}`;
  const { average, count } = ratings.summary;

  return (
    <>
      <Header />
      <main className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb"><ol><li><Link href="/">All sites</Link></li><li><Link href={sectionHref}>{section}</Link></li><li aria-current="page">This post</li></ol></nav>
        <div className="phead">
          <Link className="cat" href={sectionHref}>{section}</Link>
          <h1>{post.caption}</h1>
          <div className="meta">
            <span className="stars">
              {count ? (
                <><StarRating value={average} count={count} size={18} decorative /> <b>{(Math.round(average * 10) / 10).toFixed(1)}</b><span>({count} {count === 1 ? "rating" : "ratings"})</span></>
              ) : (
                <StarRating value={0} count={0} size={18} />
              )}
            </span>
            <span><b>{post.visitCount.toLocaleString("en-US")}</b> {post.visitCount === 1 ? "visit" : "visits"}</span>
            <span>Posted <time dateTime={isoDay(post.createdAt)}>{formatDate(post.createdAt)}</time></span>
          </div>
        </div>

        <div className="pgrid">
          <Gallery post={post} onVisit={onVisit} />
          <SideCard post={post} onVisit={onVisit} demo={demo} />

          <div className="body">
            <section className="card sec prose" aria-labelledby="h-about">
              <h2 id="h-about">About this site</h2>
              {paragraphs(post.description).map((text, i) => <p key={i}>{text}</p>)}
            </section>

            {post.skills.length > 0 && (
              <section className="card sec" aria-labelledby="h-stack">
                <h2 id="h-stack">Built with</h2>
                <div className="stack">
                  {post.skills.map((skill) => <Link key={skill.id} href={`/?skill=${encodeURIComponent(skill.slug)}`}>{skill.name}</Link>)}
                </div>
              </section>
            )}

            <RatingSummary ratings={ratings} loginHref={loginHref} />
            <Comments post={post} demo={demo} />
          </div>
        </div>

        {!demo && <MoreFrom post={post} />}
      </main>
      <RatePrompt ratings={ratings} host={hostOf(post.link)} thumb={<PromptThumb post={post} />} visitedAt={ratings.visitedAt} loginHref={loginHref} />
    </>
  );
}
