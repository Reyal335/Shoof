import type { ReactNode } from "react";
import { SiteDocument, siteMetadata } from "@/components/site-document";

export const metadata = siteMetadata;

export default function MiscLayout({ children }: { children: ReactNode }) {
  return (
    <SiteDocument fonts="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Space+Mono:wght@400;700&family=Outfit:wght@600&family=Figtree:wght@400;600&display=swap">
      {children}
    </SiteDocument>
  );
}
