# Shoof: agent instructions

Shoof is a social showcase of websites (games, portfolios, SaaS, CSS/UI, misc). Brand: navy `#101b33`, yellow `#dba40c`, blob mascot.

- Stack: React 18 + TypeScript on Vite, React Router, plain CSS. No backend yet.
- `design/` holds the approved plain-HTML pages. They are the source of truth for layout, copy, colour and behaviour. Match them at 1440px and 390px. Do not restyle.
- Posts, creators and products stay as literal JSX markup (no fetching, no seed JSON, no loops over data) until a backend task says otherwise.
- Keep the accessibility attributes from the designs (labels, roles, `aria-pressed`, `aria-selected`, `aria-current`, focus outlines, reduced motion).
- Each section page keeps its own look. Shared pieces (Header, SectionNav, FollowButton, Tabs) live in `src/components/`.
- Before you finish: `npm run build` must pass, check every route in a browser, and confirm there are no console errors.
