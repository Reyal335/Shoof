"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Stars } from "@/components/stars";
import { formatDate, isoDay } from "@/lib/dates";
import { paragraphs } from "@/lib/text";
import { getPost } from "../api";
import { useVisit } from "../hooks/use-visit";
import { CATEGORY_PATHS } from "../paths";
import { CATEGORY_LABELS } from "../post-form";
import { postKeys } from "../queries";
import type { PostDetail } from "../types";
import { Comments } from "./comments";
import { Gallery } from "./gallery";
import { MoreFrom } from "./more-from";
import { Ratings } from "./ratings";
import { SideCard } from "./side-card";
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

/**
 * One posted site: gallery, creator, ratings and comments. The server renders it from `initialPost` (so crawlers
 * and link previews get everything); TanStack Query then owns the copy, which rating and visiting update in place.
 */
export function PostPage({ initialPost }: { initialPost: PostDetail }) {
  useHashScroll();
  const { data: post } = useQuery({
    queryKey: postKeys.detail(initialPost.id),
    queryFn: () => getPost(initialPost.id),
    initialData: initialPost,
  });
  const visit = useVisit();
  const onVisit = () => visit(post.id);
  const section = CATEGORY_LABELS[post.category];
  const sectionHref = CATEGORY_PATHS[post.category];

  return (
    <>
      <Header />
      <main className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb"><ol><li><Link href="/">All sites</Link></li><li><Link href={sectionHref}>{section}</Link></li><li aria-current="page">This post</li></ol></nav>
        <div className="phead">
          <Link className="cat" href={sectionHref}>{section}</Link>
          <h1>{post.caption}</h1>
          <div className="meta">
            <span className="stars"><Stars avg={post.rating} /> <b>{post.rating.toFixed(1)}</b><span>(<span>{post.ratingCount}</span> {post.ratingCount === 1 ? "rating" : "ratings"})</span></span>
            <span><b>{post.visitCount.toLocaleString("en-US")}</b> {post.visitCount === 1 ? "visit" : "visits"}</span>
            <span>Posted <time dateTime={isoDay(post.createdAt)}>{formatDate(post.createdAt)}</time></span>
          </div>
        </div>

        <div className="pgrid">
          <Gallery post={post} onVisit={onVisit} />
          <SideCard post={post} onVisit={onVisit} />

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

            <Ratings post={post} />
            <Comments post={post} />
          </div>
        </div>

        <MoreFrom post={post} />
      </main>
    </>
  );
}
