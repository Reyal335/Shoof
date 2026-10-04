import Link from "next/link";

export type Section = "all" | "games" | "portfolios" | "saas" | "css-ui" | "misc";

const HREFS: Record<Section, string> = {
  all: "/",
  games: "/games",
  portfolios: "/portfolios",
  saas: "/saas",
  "css-ui": "/css-ui",
  misc: "/misc",
};

const DEFAULT_LABELS: Record<Section, string> = {
  all: "All sites",
  games: "Games",
  portfolios: "Portfolios",
  saas: "SaaS",
  "css-ui": "CSS & UI",
  misc: "Misc",
};

/** The "All sites / Games / ..." row at the top of each section page. Some sections restyle the labels. */
export function SectionNav({ current, labels = DEFAULT_LABELS }: { current: Section; labels?: Record<Section, string> }) {
  return (
    <nav className="secnav" aria-label="Sections">
      {(Object.keys(HREFS) as Section[]).map((section) => (
        <Link key={section} href={HREFS[section]} aria-current={section === current ? "page" : undefined}>
          {labels[section]}
        </Link>
      ))}
    </nav>
  );
}
