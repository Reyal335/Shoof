import Image from "next/image";
import { chartBars, gameCells, pick, seedOf } from "@/lib/stand-ins";
import { coverUrl } from "../paths";
import type { Post } from "../types";

// Drawn previews for a post with no screenshots, one look per section, varied by the post id. They draw someone
// else's site, not Shoof, so they keep their own literal colours. Purely decorative: the caller labels the area.

/**
 * Fills its positioned parent (.screen-item, .thumb or .mprev). `thumb` hides it from assistive tech when it sits
 * inside a labelled button.
 */
export function PostStandIn({ post, thumb }: { post: Pick<Post, "id" | "category">; thumb?: boolean }) {
  const seed = seedOf(post.id);
  const hidden = thumb || undefined;
  switch (post.category) {
    case "games":
      return (
        <div aria-hidden={hidden} className="scr s-play cells">
          {gameCells(seed, 160).map((cell, i) => <span key={i} className={cell} />)}
        </div>
      );
    case "portfolios":
      return (
        <div aria-hidden={hidden} className="scr">
          <div className="m-port"><b style={{ width: "40px", height: "7px" }} /><b style={{ width: `${70 + (seed % 25)}%`, marginTop: "10px" }} /><b style={{ width: `${45 + (seed % 30)}%` }} /><em /></div>
        </div>
      );
    case "saas":
      return (
        <div aria-hidden={hidden} className="scr">
          <div className="m-saas"><span className="sd" /><div className="mn">{chartBars(seed, 8, 30, 110).map((h, i) => <i key={i} style={{ height: `${h}px` }} />)}</div></div>
        </div>
      );
    case "css_ui":
      return (
        <div aria-hidden={hidden} className="scr">
          <div className="m-css"><div><i style={{ background: "#101b33" }} /><i style={{ background: "#dba40c", flex: 1 + (seed % 3) }} /></div><div><i style={{ background: "#9db4f0", flex: 1 + (seed % 2) }} /><i style={{ background: "#fff", flex: 2 }} /></div></div>
        </div>
      );
    case "misc":
      return (
        <div aria-hidden={hidden} className="scr s-misc">
          <Image src="/shoof-blob.svg" alt="" width={120} height={118} />
        </div>
      );
  }
}

const THUMB_COLORS = ["#2ec4b6", "#26335c", "#dba40c", "#ef6f6f"];

/** The rate prompt's 44px thumbnail: the cover, or nine cells in the design's colours, varied by the post id. */
export function PromptThumb({ post }: { post: Pick<Post, "id" | "media"> }) {
  const cover = coverUrl(post);
  if (cover) {
    // eslint-disable-next-line @next/next/no-img-element -- media can sit on any https host
    return <img className="cover-img" src={cover} alt="" />;
  }
  const seed = seedOf(post.id);
  return (
    <span className="pthumb">
      {Array.from({ length: 9 }, (_, i) => <i key={i} style={{ background: i % 2 ? "#26335c" : pick(seed + i, THUMB_COLORS) }} />)}
    </span>
  );
}
