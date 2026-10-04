import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/shared.css";

export const siteMetadata: Metadata = {
  title: "Shoof",
  description: "Don't describe your site. Show it.",
};

// The <html> shell for the public section pages. Each section is its own root layout (route group) so its
// page-wide CSS (body background, h1, .tab, ...) never leaks into another section: Next.js does not unload
// stylesheets on client-side navigation, and crossing root layouts forces a full page load instead.
export function SiteDocument({ fonts, children }: { fonts: string; children: ReactNode }) {
  return (
    <html lang="en">
      {/* eslint-disable-next-line @next/next/no-head-element -- the rule targets pages/; this is an App Router root layout */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href={fonts} />
      </head>
      <body>{children}</body>
    </html>
  );
}
