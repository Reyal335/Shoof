"use client";

import { useState } from "react";
import { CategoryTabs, categoryTabId, type Category } from "./category-tabs";
import { FeaturedCard } from "./featured-card";
import { ProjectCard, type Project } from "./project-card";
import { StackFilters } from "./stack-filters";

// Mock posts, copied from design/Feed.html. Replace with the posts API when it exists.
const POSTS: Project[] = [
  {
    name: "Browser game",
    title: "[Project name]",
    description: "A browser game. One line on what it is and how you play.",
    category: "Games",
    stack: ["TypeScript", "Phaser", "Vite"],
    collaborators: ["#dba40c", "#6b7ba8"],
    likes: 128,
    preview: {
      kind: "game",
      cells: "020102010201021001200030003000300020011003000300030003000300120020003000",
    },
  },
  {
    name: "Portfolio",
    title: "[Project name]",
    description: "Personal portfolio with case studies and a contact form.",
    category: "Portfolios",
    stack: ["Next.js", "Tailwind", "React"],
    collaborators: [],
    likes: 74,
    preview: { kind: "portfolio" },
  },
  {
    name: "CSS layout study",
    title: "[Project name]",
    description: "A layout study built with flex and grid, no JavaScript.",
    category: "CSS & UI",
    stack: ["HTML & CSS"],
    collaborators: ["#3b4f86"],
    likes: 203,
    preview: { kind: "css" },
  },
  {
    name: "SaaS dashboard",
    title: "[Project name]",
    description: "A tool that solves one problem well. Say who it is for.",
    category: "SaaS",
    stack: ["React", "Node.js", "PostgreSQL"],
    collaborators: ["#dba40c", "#3b4f86", "#6b7ba8"],
    likes: 311,
    preview: { kind: "saas", bars: [32, 50, 38, 64, 53, 74, 59, 46, 69, 56] },
  },
  {
    name: "Puzzle game",
    title: "[Project name]",
    description: "A small puzzle game made in a weekend for a game jam.",
    category: "Games",
    stack: ["React", "TypeScript"],
    collaborators: [],
    likes: 59,
    preview: {
      kind: "game",
      cells: "210101020102010201021001200030003000300020012002000300030003000300120020",
    },
  },
  {
    name: "Illustrator portfolio",
    title: "[Project name]",
    description: "Illustrator portfolio with a fast image gallery.",
    category: "Portfolios",
    stack: ["Vue", "Tailwind"],
    collaborators: ["#6b7ba8"],
    likes: 96,
    preview: { kind: "portfolio" },
  },
  {
    name: "Tracking dashboard",
    title: "[Project name]",
    description: "Dashboard for tracking something people actually need to track.",
    category: "SaaS",
    stack: ["Vue", "Node.js", "TypeScript"],
    collaborators: ["#3b4f86"],
    likes: 142,
    preview: { kind: "saas", bars: [56, 43, 66, 48, 72, 61, 40, 54, 67, 77] },
  },
  {
    name: "Animated components",
    title: "[Project name]",
    description: "Animated components collection with copy-paste snippets.",
    category: "CSS & UI",
    stack: ["HTML & CSS", "TypeScript"],
    collaborators: [],
    likes: 187,
    preview: { kind: "css" },
  },
];

const SORTS = ["Trending", "New", "Following"];

const GRID_ID = "feed-grid";

export function HomeFeed() {
  const [category, setCategory] = useState<Category>("All");
  const [stack, setStack] = useState<string | null>(null);
  // Kept here rather than in each card so a like survives the card being filtered out.
  const [liked, setLiked] = useState<ReadonlySet<string>>(new Set());

  function toggleLike(name: string) {
    setLiked((current) => {
      const next = new Set(current);
      if (!next.delete(name)) next.add(name);
      return next;
    });
  }

  const shown = POSTS.filter(
    (post) =>
      (category === "All" || post.category === category) &&
      (stack === null || post.stack.includes(stack)),
  );
  const isUnfiltered = category === "All" && stack === null;

  return (
    <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-7 px-4 pt-5 pb-12 tablet:px-8 tablet:pt-9 tablet:pb-16">
      <div>
        <h1 className="text-[44px]/[48px] font-semibold tracking-[-1.2px]">
          Sites people are shipping right now.
        </h1>
        <p className="mt-2 mb-0 text-lg/[27px] text-ink-muted">
          See the real thing first. Open any card and the site is live.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <CategoryTabs value={category} onChange={setCategory} controls={GRID_ID} />
        <StackFilters value={stack} onChange={setStack} />
      </div>

      {isUnfiltered && <FeaturedCard />}

      <div className="flex items-center justify-between">
        <span aria-live="polite" className="text-[15px] text-ink-muted">
          {shown.length} {shown.length === 1 ? "site" : "sites"}
        </span>
        {/* Sorting isn't wired up yet; these mirror the design. */}
        <div className="flex gap-1.5 text-sm font-semibold">
          {SORTS.map((sort, i) => (
            <span
              key={sort}
              className={`rounded-lg px-3 py-1.5 ${i === 0 ? "bg-navy text-white" : "text-navy"}`}
            >
              {sort}
            </span>
          ))}
        </div>
      </div>

      <section
        id={GRID_ID}
        role="tabpanel"
        aria-labelledby={categoryTabId(category)}
        className="grid grid-cols-[minmax(0,1fr)] gap-6 tablet:grid-cols-2 desktop:grid-cols-3"
      >
        {shown.map((post) => (
          <ProjectCard
            key={post.name}
            project={post}
            liked={liked.has(post.name)}
            onToggleLike={() => toggleLike(post.name)}
          />
        ))}
      </section>

      {shown.length === 0 && (
        <div className="rounded-[20px] border border-dashed border-field-border bg-white p-12 text-center text-[17px] text-ink-muted">
          No sites match these filters yet. Clear a filter or post the first one.
        </div>
      )}
    </main>
  );
}
