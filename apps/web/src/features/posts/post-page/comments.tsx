"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useSession } from "@/features/auth/hooks/use-session";
import { getSessionUserId } from "@/features/auth/session";
import { timeAgo } from "@/lib/dates";
import { describeError } from "@/lib/describe-error";
import { useComments } from "../hooks/use-comments";
import { postHref, profileHref } from "../paths";
import type { Post, PostComment } from "../types";

const MAX = 500;

/** Composer and comment list, oldest first. You can delete your own comments, and any comment on your own post. */
export function Comments({ post, demo = false }: { post: Post; demo?: boolean }) {
  if (demo) {
    return (
      <section className="card sec" aria-labelledby="h-comments">
        <h2 id="h-comments">Comments</h2>
        <p className="hint">The demo post has no comments. Open a real post to read and write them.</p>
      </section>
    );
  }
  return <PostComments post={post} />;
}

function PostComments({ post }: { post: Post }) {
  const session = useSession();
  const me = session.isAuthenticated ? getSessionUserId() : null;
  const { comments, total, isPending, isError, refetch, hasMore, isLoadingMore, loadMore, add, remove } = useComments(post.id);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const field = useRef<HTMLTextAreaElement>(null);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = text.trim();
    if (!value) {
      setError("Write something before posting.");
      field.current?.focus();
      return;
    }
    setError("");
    add.mutate(value, {
      onSuccess: () => setText(""),
      onError: (err) => setError(describeError(err, "comment")),
    });
  }

  const canDelete = (comment: PostComment) => me !== null && (comment.userId === me || post.userId === me);

  return (
    <section className="card sec" aria-labelledby="h-comments">
      <h2 id="h-comments">Comments <span className="n">(<span>{total}</span>)</span></h2>
      {session.status === "anonymous" ? (
        <p className="composer-note">
          <Link href={`/login?next=${encodeURIComponent(`${postHref(post)}#h-comments`)}`}>Log in</Link> to leave a comment.
        </p>
      ) : (
        <form className="composer" noValidate onSubmit={submit} aria-busy={add.isPending}>
          <label htmlFor="comment">Add a comment</label>
          <textarea
            id="comment"
            ref={field}
            maxLength={MAX}
            placeholder="What did you like? What would you change?"
            aria-describedby="comment-hint comment-err"
            aria-invalid={error ? true : undefined}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError("");
            }}
          />
          <span className="err" id="comment-err" role="alert" hidden={!error}>{error}</span>
          <div className="crow">
            <span className="hint" id="comment-hint">Be kind and specific. Up to {MAX} characters.</span>
            <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span className="count" aria-hidden="true">{text.length} / {MAX}</span>
              <button type="submit" className="send" disabled={add.isPending}>{add.isPending ? "Posting…" : "Post comment"}</button>
            </span>
          </div>
        </form>
      )}

      {isPending && <p className="hint" role="status">Loading comments…</p>}
      {isError && !comments.length && (
        <p className="hint" role="alert">We couldn&apos;t load the comments. <button type="button" className="linkbtn" onClick={() => refetch()}>Try again</button></p>
      )}
      {!isPending && !isError && !comments.length && <p className="hint">No comments yet. Be the first to say what you think.</p>}

      {comments.length > 0 && (
        <ol className="clist" aria-label="Comments">
          {comments.map((comment) => (
            <li key={comment.id}>
              {comment.author?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- avatars can sit on any https host
                <img className="av avatar-img" src={comment.author.avatarUrl} alt="" />
              ) : (
                <span className="av" aria-hidden="true" style={{ background: "#6b7ba8" }} />
              )}
              <div className="cbody">
                <div className="chead">
                  {comment.author ? <Link href={profileHref(comment.author.username)}>{comment.author.displayName}</Link> : <b>Former member</b>}
                  {comment.userId === post.userId && <span className="badge">Creator</span>}
                  <time dateTime={comment.createdAt}>{timeAgo(comment.createdAt)}</time>
                  {canDelete(comment) && (
                    <button
                      type="button"
                      className="linkbtn cdel"
                      disabled={remove.isPending && remove.variables === comment.id}
                      onClick={() => remove.mutate(comment.id)}
                      aria-label={`Delete comment by ${comment.author?.displayName ?? "former member"}`}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p>{comment.content}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
      {remove.isError && <p className="err" role="alert">{describeError(remove.error, "delete that comment")}</p>}
      {hasMore && (
        <div className="more-row">
          <button type="button" className="more-btn" disabled={isLoadingMore} onClick={() => loadMore()}>{isLoadingMore ? "Loading…" : "Show more comments"}</button>
        </div>
      )}
    </section>
  );
}
