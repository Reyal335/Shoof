import { Header } from "@/components/header";
import "./post-placeholder.css";

/** Placeholder for the post page until it has a design: the comment and rating anchors notifications link to. */
export function PostPlaceholderPage() {
  return (
    <>
      <Header />
      <main className="wrap">
        <h1>A tiny arcade game about a blob that can&apos;t stop bouncing</h1>
        <p>The post page isn&apos;t built yet. This placeholder holds the sections that notifications link to.</p>
        <section id="h-ratings" aria-labelledby="ratings-title">
          <h2 id="ratings-title">Ratings</h2>
          <p>Ratings will show here.</p>
        </section>
        <section id="h-comments" aria-labelledby="comments-title">
          <h2 id="comments-title">Comments</h2>
          <p>Comments will show here.</p>
        </section>
      </main>
    </>
  );
}
