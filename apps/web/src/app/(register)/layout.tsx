import type { ReactNode } from "react";
import { SiteDocument, siteMetadata } from "@/components/site-document";

export const metadata = siteMetadata;

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return (
    <SiteDocument fonts="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Figtree:wght@400;500;600&display=swap">
      {children}
    </SiteDocument>
  );
}
