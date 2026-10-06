import type { Metadata } from "next";
import type { ReactNode } from "react";

// Own root layout (route group) so these pages' plain CSS (body flex column, main, h1, ...) stays out of the other sections.
export const metadata: Metadata = {
  description: "Don't describe your site. Show it.",
};

export default function StatusLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      {/* eslint-disable-next-line @next/next/no-head-element -- the rule targets pages/; this is an App Router root layout */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Figtree:wght@400;500;600&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
