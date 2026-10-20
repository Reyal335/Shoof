"use client";

import { useState } from "react";
import { hostOf } from "../paths";
import type { Post } from "../types";
import { PostStandIn } from "./stand-ins";

const OPEN_ICON = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg>;

/**
 * The post's screenshots with Previous/Next (wrapping) and thumbnails, or one drawn preview while it has none.
 * `onVisit` fires when "Open" is clicked.
 */
export function Gallery({ post, onVisit }: { post: Post; onVisit: () => void }) {
  const images = post.media.filter((m) => m.type === "image");
  const [cur, setCur] = useState(0);
  const show = (i: number) => setCur((i + images.length) % images.length);
  const host = hostOf(post.link);

  return (
    <section className="media" aria-label="Screenshots">
      <div className="viewer">
        <div className="vbar">
          <i /><i /><i />
          <span className="url">{host}</span>
          <a href={post.link} target="_blank" rel="noopener noreferrer nofollow ugc" className="vopen" aria-label={`Open ${host} in a new tab`} onClick={onVisit}>Open {OPEN_ICON}</a>
        </div>
        <div className="screen">
          {images.length ? (
            images.map((image, i) => (
              <div className="screen-item" key={image.id} hidden={cur !== i} role="img" aria-label={`Screenshot ${i + 1} of ${images.length}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- media can sit on any https host */}
                <img className="cover-img" src={image.url} alt="" />
              </div>
            ))
          ) : (
            <div className="screen-item" role="img" aria-label={`Preview drawn for ${post.caption}. No screenshots yet.`}>
              <PostStandIn post={post} />
            </div>
          )}
        </div>
        <div className="vfoot">
          {images.length > 1 ? (
            <>
              <span aria-live="polite"><b>Screenshot {cur + 1}</b> &middot; <span>{cur + 1} of {images.length}</span></span>
              <span className="vnav"><button type="button" aria-label="Previous screenshot" onClick={() => show(cur - 1)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg></button><button type="button" aria-label="Next screenshot" onClick={() => show(cur + 1)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg></button></span>
            </>
          ) : (
            <span>{images.length ? "1 screenshot" : "No screenshots yet. Open the live site to see the real thing."}</span>
          )}
        </div>
      </div>
      {images.length > 1 && (
        <div className="thumbs" role="group" aria-label="Choose a screenshot">
          {images.map((image, i) => (
            <button key={image.id} type="button" className="thumb" aria-pressed={cur === i} aria-label={`Show screenshot ${i + 1}`} onClick={() => show(i)}>
              {/* eslint-disable-next-line @next/next/no-img-element -- media can sit on any https host */}
              <img className="cover-img" src={image.url} alt="" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
