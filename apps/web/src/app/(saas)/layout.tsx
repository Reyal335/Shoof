import type { ReactNode } from "react";
import { SiteDocument, siteMetadata } from "@/components/site-document";

export const metadata = siteMetadata;

export default function SaasLayout({ children }: { children: ReactNode }) {
  return (
    <SiteDocument fonts="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Outfit:wght@600&family=Figtree:wght@400;600&display=swap">
      {children}
    </SiteDocument>
  );
}
