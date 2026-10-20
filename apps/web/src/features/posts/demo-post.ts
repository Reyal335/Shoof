import { DEMO_POST_ID } from "@/features/ratings/ratings-api";
import type { PostDetail } from "./types";

/**
 * /post/demo: the design's sample post (design/Post.html), rendered with no API. Its ratings come from the mock client
 * and start at the design's 4.6 from 128. Only served outside production builds, or when NEXT_PUBLIC_USE_MOCK_API is
 * "true", so a fake post never shows on the live site.
 */
export function demoPostEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
}

export const DEMO_POST: PostDetail = {
  id: DEMO_POST_ID,
  userId: "demo-creator",
  category: "games",
  caption: "A tiny arcade game about a blob that can't stop bouncing",
  description: [
    "A one-button arcade game. You are a blob that bounces on its own: tap the screen or press Space to change direction, and collect the yellow cells before the timer runs out.",
    "I built it in a week for a game jam to learn Phaser's physics. Each level adds one new idea: moving walls, then sticky floors, then cells that run away from you.",
    "Feedback I'd love: does level 3 feel too hard, and does the bounce feel fair on a phone?",
  ].join("\n\n"),
  link: "https://yourgame.example.com",
  repoUrl: "https://github.com/example/blob-bounce",
  rating: 4.59,
  ratingCount: 128,
  visitCount: 3412,
  createdAt: "2026-10-03T12:00:00.000Z",
  updatedAt: "2026-10-08T12:00:00.000Z",
  media: [],
  skills: [
    { id: "demo-phaser", slug: "phaser", name: "Phaser", kind: "framework" },
    { id: "demo-typescript", slug: "typescript", name: "TypeScript", kind: "language" },
    { id: "demo-vite", slug: "vite", name: "Vite", kind: "platform" },
  ],
  author: { id: "demo-creator", username: "creator", displayName: "[Creator name]", avatarUrl: null },
  ratingDistribution: { 1: 1, 2: 3, 3: 8, 4: 24, 5: 92 },
};
