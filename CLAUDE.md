@AGENTS.md
# Shoof

Global social/creator platform. "Shoof" = word play on "show-off". Repo/monorepo name: `artist-hub`.

## Product Vision

A social network centered on **people, skills, creative work, gear, and communities**, not another TikTok/Instagram clone.
Discovery is driven by *what people create* and *what they use*:
- "Creators using this guitar" / "posts made with this camera" / "artists using this tablet"
- Browse by skill, category, interest, gear, hashtag. Geography is only an optional filter.

Core capabilities: profiles, skills/interests, gear showcase, posting (images/video/audio), follow, like/comment/share/save,
search, notifications. Later: messaging, donations, supporter tiers, sponsored challenges, gear affiliate/marketplace.

**Differentiator: Gear is first-class structured data**, not free text. Creator -> uses Gear; Post -> made with Gear; Gear -> used by Creators.

## Principles (in priority order)

1. Correct domain boundaries
2. Clean APIs
3. Maintainability
4. Security
5. Good database design
6. Scalability where it matters
7. Simplicity where scale doesn't yet justify complexity

**Do not overengineer.** The architecture should *evolve*, not predict final scale on day one.
More services or more infrastructure is NOT automatically better. Add infra only when a real requirement exists.

## Architecture Overview

```
Next.js (apps/web)  ->  NestJS modular monolith (apps/api)  ->  PostgreSQL
                              |-> Redis (only when a use case exists)
                              |-> Object storage + CDN (media)
                              |-> Background workers (queue)
```

- **Start as a modular monolith.** No microservices, Kafka, multiple databases, or event-driven complexity until justified.
- One PostgreSQL database, with *logical* ownership of tables per module.
- PostgreSQL is the single source of truth. Redis is never primary storage.
- Extraction candidates later (only if independent scaling/deploy/isolation/infra is genuinely needed):
  media processing, search, feed/recommendations, notifications, payments, messaging, analytics.

## Monorepo Layout (pnpm workspaces)

```
artist-hub/
  apps/
    web/        # Next.js + React + TypeScript
    api/        # NestJS modular monolith
  packages/
    types/      # shared TS types (only when genuinely useful)
    validation/ # shared Zod schemas (when appropriate)
    config/     # shared config (when appropriate)
  docker/  .github/  docker-compose.yml  pnpm-workspace.yaml
```

- `node_modules/` and `dist/` are generated and gitignored; never treat as source.
- Always keep this structure when proposing folder layouts: `apps/web`, `apps/api`, `packages/*`.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js, React, TypeScript, TanStack Query, Zustand (only where needed), React Hook Form, Zod |
| Backend | NestJS, TypeScript, REST (`/api/v1/...`), WebSockets only where real-time helps |
| Data | PostgreSQL (primary), Redis (when needed) |
| Infra | Docker, object storage, CDN, background workers |

TypeScript end-to-end wherever practical. Next.js is preferred over a plain SPA because public profiles, posts, gear
and skill pages need SEO and social sharing.

## Backend Module Rules (the most important section)

Each NestJS module owns its business logic AND its data access:
`XController -> XService -> XRepository -> tables`.

- **A module never touches another module's repository or tables.** Cross-module access goes through the other
  module's exported *service* (public interface).
  - Bad:  `PostsService -> UsersRepository`
  - Good: `PostsService -> UsersService -> UsersRepository`
- Modules export services only (e.g. `UsersModule exports [UsersService]`); repositories stay private.
- No cross-module joins/queries into foreign tables. If data is needed, call the owner's service.
- Design boundaries so any module could be extracted into a service later, but do **not** implement that now.
- Auth lives in its own `auth/` module (controller, service, guards, strategies, dto) and supplies the authenticated
  identity to the rest of the app. Never duplicate auth logic in other modules.

Candidate modules (create **only** as the MVP needs them, not all upfront):
`auth, users, profiles, categories, skills, gear, posts, media, comments, likes, follows, feed, search,
notifications, messaging, donations, payments, moderation, analytics`

## Domain Model (core entities)

- Identity: `users, profiles, user_skills, skills, categories`
- Gear: `gear, gear_brands, gear_models, user_gear`
- Content: `posts, post_media, post_gear, post_skills`
- Social: `comments, likes, follows, bookmarks, notifications`
- Later: `conversations, messages, donations, payments, payouts`, moderation and analytics entities

Normalize appropriately. Gear is structured (brand -> model), enabling gear pages and "who uses this" discovery.

## Media Architecture

Large files **never** pass through NestJS.

```
Client -> NestJS (authorize upload, issue signed URL) -> Client uploads direct to object storage
       -> background media worker (transcode, thumbnails, metadata, moderation) -> CDN -> users
```

NestJS manages metadata and permissions only. Media processing is treated separately from normal API/DB operations.

## Background Jobs and Redis

- Use workers for anything that shouldn't block a request: video processing, thumbnails, moderation, email,
  notifications, search indexing, analytics, feed generation.
- Start with a simple queue. Redis is introduced for queues, caching, rate limiting, or ephemeral data **when a real
  use case appears**.

## API Conventions

- REST, versioned from day one: `/api/v1/...`
- Resource style: `POST /posts/:id/likes`, `DELETE /posts/:id/likes`, `POST /users/:id/follow`,
  `GET /users/:username/posts`, `GET /users/:username/gear`
- WebSockets only for messaging, notifications, typing indicators, live activity. The app is not WebSocket-based.

## Frontend Conventions

- Organize by **feature**, not by global component/service buckets:
  `apps/web/src/{app, features/{auth,profile,posts,feed,gear,comments,follows,notifications,messaging,donations,search}, components, hooks, stores, lib, types}`
- Data flow: `Component -> React hook -> feature API client -> NestJS API`. No scattered raw `fetch` calls in components.
- TanStack Query for server state; Zustand only for genuine client state; Zod + React Hook Form for forms.
- Public routes should be SSR/indexable: `/@username`, `/@username/posts/:id`, `/@username/gear`,
  `/gear/:brand/:model`, `/skills/:skill`, `/categories/:category`.

## Payments / Donations

- Separate: donation (business record) -> payment (provider transaction) -> creator earnings -> payouts.
- Provider-agnostic: `DonationsService -> PaymentService -> PaymentProviderAdapter`. No provider-specific code
  outside adapters. Multiple providers expected (availability varies by country).
- Use provider-hosted secure flows. **Never store card numbers, CVVs, or payment credentials.**
- Provider **webhooks are authoritative** for payment completion; never trust the frontend.

## Global-First Rules

Never hardcode the Philippines, PHP, English, GCash, or any single country/currency/provider into core architecture.
Support per-user country, locale, timezone, preferred currency, and languages. Preserve content's original language
(translation can come later). Money handling must be currency-aware.

## Discovery

Start with simple, **explainable** signals: follows, matching skills, categories, gear, interests, freshness,
engagement. No advanced TikTok-style recommender early; it can be extracted later.
**Algorithmic visibility is never a paid feature.**

## Monetization Philosophy

Core social features stay free (account, profile, follow, post, gear profiles, likes, comments, discovery).
Optional later: donations, memberships, creator pro tools/analytics, gear affiliate/marketplace, sponsorships,
sponsored challenges, carefully selected ads.
Avoid: selling user data, pay-to-win visibility, paywalling basic participation, aggressive monetization.

## How Claude Should Work on This Project

1. Preserve the modular monolith unless there is a strong, stated reason to change it.
2. Prefer practical, production-oriented solutions over complex ones. Explain **trade-offs**, not just code.
3. Enforce module boundaries (service-to-service only; repositories stay private).
4. When suggesting a dependency or infrastructure, say why it's needed and whether it's needed *now* or can wait.
5. When proposing an architectural change, explain its effect on scalability and maintainability.
6. Consider future extraction when drawing module boundaries, but never implement microservices prematurely.
7. Keep PostgreSQL as source of truth, media separate from API/DB paths, and payments behind the adapter.
8. Design for global use; flag any Philippines- or provider-specific assumption.
9. Prefer TypeScript end-to-end; keep folder suggestions inside `apps/web`, `apps/api`, `packages/*`.
10. Build only what the current MVP needs. Introduce new modules and infra incrementally.