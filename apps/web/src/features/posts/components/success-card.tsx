import Image from "next/image";
import Link from "next/link";
import type { Ref } from "react";
import { postHref } from "../paths";
import { CATEGORY_LABELS } from "../post-form";
import type { Post } from "../types";

/** Shown in place of the form once the API has saved the post. The page moves focus to the heading. */
export function SuccessCard({ post, titleRef, onPostAnother }: { post: Post; titleRef: Ref<HTMLHeadingElement>; onPostAnother: () => void }) {
  return (
    <section className="done" aria-labelledby="done-title">
      <div className="medal">
        <Image src="/shoof-blob.svg" alt="" width={66} height={65} />
        <span className="tick">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#101b33" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
        </span>
      </div>
      <h2 id="done-title" tabIndex={-1} ref={titleRef}>Your site is posted</h2>
      <p>{`“${post.caption}” is now in ${CATEGORY_LABELS[post.category]} and on the home feed.`}</p>
      <div className="acts">
        <Link className="go" href={postHref(post)}>View your post</Link>
        <button className="alt" type="button" onClick={onPostAnother}>Post another site</button>
      </div>
    </section>
  );
}
