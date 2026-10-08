import Image from "next/image";
import { CATEGORY_LABELS, displayHost } from "../post-form";
import type { PostCategory } from "../types";

// The game stand-in's pixel grid: the same sin/cos colour formula as design/CreatePost.html, seed 3.
const CELL_PALETTE = ["#26335c", "#26335c", "#26335c", "#2ec4b6", "#dba40c", "#ef6f6f", "#7d89a8"];
const GAME_CELLS = Array.from({ length: 60 }, (_, i) => {
  const seed = 3;
  const v = Math.abs(Math.sin(i * 2.3 + seed) * 3.4 + Math.cos(i * 0.7 + seed * 1.7) * 2.6);
  return CELL_PALETTE[Math.floor(v) % 7];
});

/** CSS-drawn stand-ins shown until a screenshot is added. Decorative: the image area carries the label. */
function StandIn({ category }: { category: PostCategory }) {
  switch (category) {
    case "games":
      return (
        <div className="sg">
          {GAME_CELLS.map((color, i) => <span key={i} style={{ background: color }}></span>)}
        </div>
      );
    case "portfolios":
      return (
        <div className="sp">
          <i style={{ width: "54px", height: "8px" }}></i>
          <i style={{ width: "88%", height: "18px", marginTop: "10px" }}></i>
          <i style={{ width: "62%", height: "18px" }}></i>
          <i style={{ width: "54px", height: "22px", borderRadius: "11px", background: "#dba40c" }}></i>
        </div>
      );
    case "saas":
      return (
        <div className="ss">
          <div className="n"></div>
          <div className="b"><div style={{ height: "36px" }}></div><div style={{ flex: 1 }}></div></div>
        </div>
      );
    case "css_ui":
      return (
        <div className="sc">
          <div style={{ height: "50px" }}>
            <i style={{ flex: 1, background: "#101b33" }}></i>
            <i style={{ flex: 2, background: "#dba40c" }}></i>
            <i style={{ flex: 1, background: "#7d89a8" }}></i>
          </div>
          <div style={{ flex: 1 }}>
            <i style={{ flex: 1, background: "#9db4f0" }}></i>
            <i style={{ flex: 2, background: "#101b33" }}></i>
          </div>
        </div>
      );
    case "misc":
      return <div className="sm"><Image src="/shoof-blob-navy.svg" alt="" width={96} height={95} /></div>;
  }
}

type PreviewProps = {
  category: PostCategory | "";
  caption: string;
  description: string;
  link: string;
  techStack: string[];
  coverUrl?: string;
};

/** How the post will look as a feed card, updated as the person types. */
export function PostPreview({ category, caption, description, link, techStack, coverUrl }: PreviewProps) {
  const cap = caption.trim();
  const desc = description.trim();
  const extraTags = techStack.length - 4;

  return (
    <aside className="pside" aria-label="Preview">
      <h2>Preview</h2>
      <article className="pcard">
        <div className="pshot" role="img" aria-label={coverUrl ? "Cover screenshot of your site" : "Stand-in preview"}>
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- a local blob: URL, nothing for next/image to optimise
            <img className="cv" src={coverUrl} alt="" />
          ) : category ? (
            <StandIn category={category} />
          ) : (
            <div className="empty">Your first screenshot shows here</div>
          )}
          {category && <span className="badge">{CATEGORY_LABELS[category]}</span>}
          <span className="visit" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg>
          </span>
        </div>
        <div className="pbody">
          <h3 className={cap ? undefined : "ph"}>{cap || "Your caption shows here"}</h3>
          <p className={desc ? undefined : "ph"}>{desc || "Your description shows here."}</p>
          <div className="chips">
            {techStack.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
            {extraTags > 0 && <span>{`+${extraTags}`}</span>}
          </div>
          <div className="pfoot">
            <span className="av"></span>
            <b>[Creator]</b>
            <span className="host">{displayHost(link) ?? "yoursite.example.com"}</span>
          </div>
        </div>
      </article>
      <p className="pnote">This is how your post will look on the feed.</p>
    </aside>
  );
}
