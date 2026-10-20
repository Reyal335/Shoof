"use client";

import Link from "next/link";
import { firstLine } from "@/lib/text";
import { RatingChip } from "../components/rating-chip";
import { usePostList } from "../hooks/use-post-list";
import { coverUrl, postHref } from "../paths";
import type { Post } from "../types";
import { PostStandIn } from "./stand-ins";

/** Up to three other sites by the same creator. Hidden when there are none. */
export function MoreFrom({ post }: { post: Post }) {
  const username = post.author?.username ?? "";
  const list = usePostList({ kind: "user", username }, {}, { pageSize: 4, enabled: !!post.author });
  const others = list.posts.filter((p) => p.id !== post.id).slice(0, 3);
  if (!post.author || !others.length) return null;

  return (
    <section className="more" aria-labelledby="h-more">
      <h2 id="h-more">More from {post.author.displayName}</h2>
      <div className="mgrid">
        {others.map((other) => {
          const cover = coverUrl(other);
          return (
            <article className="mcard" key={other.id}>
              <div className="mprev" role="img" aria-label={`Preview of ${other.caption}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- media can sit on any https host */}
                {cover ? <img className="cover-img" src={cover} alt="" /> : <PostStandIn post={other} />}
              </div>
              <div className="mbody">
                <h3><Link href={postHref(other)}>{other.caption}</Link></h3>
                <p>{firstLine(other.description)}</p>
                <span className="r"><RatingChip rating={other.rating} count={other.ratingCount} /></span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
