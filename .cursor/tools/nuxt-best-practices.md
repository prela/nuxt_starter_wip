# Enterprise-grade, future‑proof Nuxt 4 setup (concise best practices)

## Outlined an enterprise Nuxt 4 blueprint
  - Layered architecture, hybrid rendering, Content v3 with schemas, strict typing/validation, security, performance, and TDD/CI.

## Architecture and boundaries
  - Use Nuxt layers to enforce separation of concerns: `core` (base config, composition utilities), `ui` (design system, atomic components with Nuxt UI), `api` (server routes, services, repositories), `content` (Content v3, collections, schemas). Keep domain/business logic in `server/services` with interfaces and DI-like factories, and data access in `server/repositories`.
  - Keep feature modules independent and testable. Expose public APIs (types, composables) at layer boundaries.

## Rendering, caching, and delivery
  - Hybrid rendering with Route Rules: use `prerender`, `swr`, `isr`, `ssr: false` per route. Cache static-like pages (marketing, docs) with `swr` or `isr`; keep admin fully SSR or CSR-only as needed.
  - Example:
```ts
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },
    '/docs/**': { swr: 3600 },
    '/blog/**': { isr: 3600 },
    '/admin/**': { ssr: false },
    '/api/**': { cors: true },
  },
})
```
  - Images and assets: use `@nuxt/image` with IPX in dev and CDN providers in prod; standardize presets by use case (avatar, card, hero) and prefer raster images to ensure transformations. Use `@nuxt/fonts` and `@nuxt/scripts` for performance and safety.

## Content v3 (collections-first)
  - Always define collections in `content.config.ts`; add `zod` schemas for type safety, searchable fields, and consistent frontmatter. Use `queryCollection`, `queryCollectionNavigation`, and `queryCollectionItemSurroundings` per docs.

## State, types, and validation
  - Use Pinia with strict typing and SSR-safe patterns. Keep stores thin; heavy logic belongs to services/composables.
  - Validate all inputs and runtime config via Zod (env, API payloads, query params). Export reusable types and type guards.

## Security and headers
  - `nuxt-security` with strict CSP including nonce (`'nonce-{{nonce}}'`), report-only pipelines first, then enforce. Maintain a `/api/csp-report` with rate limiting.
  - Apply consistent security headers (frame-ancestors, MIME sniffing, referrer policy); keep route-specific exceptions in `routeRules.headers`.

## Performance and costs
  - Follow Nuxt’s performance guide: lazy components (`Lazy*`), lazy hydration, smart prefetch, use `useAsyncData`/`useFetch` to avoid duplicate fetches, and analyze bundles regularly ([docs](https://nuxt.com/docs/4.x/guide/best-practices/performance)).
  - Prefer built-in modules (Image, Fonts, Scripts) over ad‑hoc solutions. Apply caching at Nitro and proxy/CDN layers.

## Testing and CI/CD (TDD)
  - Red–Green–Refactor: write unit tests for composables and services, integration tests around server routes, and E2E with Playwright for critical flows.
  - Enforce 80%+ coverage; run lint, type-check, unit, e2e in CI. Use preview deploys (Coolify) with smoke checks for headers, CSP, and caching.

## Observability and resilience
  - Structured server logging, error boundaries in UI, graceful error handlers in Nitro. Add basic health checks and readiness endpoints; ensure no-cache on health routes.
