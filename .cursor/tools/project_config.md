# project_config.md

## Goal
Enterprise Nuxt 4 Starter establishes a production-ready, enterprise-grade Nuxt 4 starter template utilizing a sophisticated layered architecture approach. The design prioritizes maximum flexibility, maintainability, and scalability while maintaining clean separation of concerns across presentation, business logic, data access, and infrastructure layers.

The architecture employs Nuxt 4's native layer system to create loosely-coupled modules that can be independently developed, tested, and deployed. This approach enables teams to customize specific aspects without affecting the entire application, making it ideal for organizations that need to rapidly bootstrap multiple projects with varying requirements.

Project follows Domain Modeling by Domain-Driven Design (DDD) and driving implementation by Test-Driven Development (TDD) principles throughout, ensuring robust code quality and facilitating future modifications. Each layer is designed with clear interfaces and dependency injection patterns, allowing for seamless integration testing and component replacement without architectural changes.

## Tech Stack
- **Language(s):** TypeScript | Javascript
- **Framework(s):** Nuxt 4 | Vite | unjs
- **Modules / Addons:** Nuxt UI | VueUse | Pinia | Nuxt SEO | Nuxt Content etc
- **Build / Tooling:** pnpm | Vite | AntFu eslint | Vitest | PlayWright | trpc-nuxt | zod | prisma ORM | Docker | GitHub Actions | Coolify | Hetzner VPS | MySQL

## Patterns
### Critical requirements
The solution MUST:
- Domain Modeling with DDD while Implementation Driving with TDD
- Implement layered architecture using Nuxt 3 layers for maximum modularity
- Maintain complete flexibility for customization without architectural constraints
- Follow enterprise-grade development practices
- Include comprehensive documentation for each layer and component
### Core_foundation
- TypeScript with ```<script setup lang="ts"></script><template></template>``` and strict type-checking
- Auto-imports configuration
- Code quality: Antfu ESLint configuration
- Clear separation: API concerns from UI logic
- UI foundation: Atomic Design Systems, Nuxt UI (free tier), TailwindCSS (utility-first)
- Layout: Mobile-first responsive design with dark/light mode
- Accessibility: WCAG 2.1 AA compliance, full compatibility with assistive technologies
- Type Safety: Zod schema validation throughout the application, schema.org
- API Contracts: Strong typing for all data exchange points
### Core Design Principles
The layered architecture follows Domain-Driven Design (DDD) principles with clear boundaries:
- Separation of Concerns: Each layer has distinct responsibilities with well-defined interfaces
- Dependency Inversion: Higher layers depend on abstractions, not implementations
- Loose Coupling: Layers communicate through interfaces and events, not direct dependencies
- High Cohesion: Related functionality is grouped within appropriate layers
- Testability: Each layer can be tested in isolation with proper mocking
### Performance_optimizations
- Caching Strategy: HTTP cache control headers configuration
- Loading Optimization: Lazy loading for components and routes
- Core Web Vitals: Performance budgets and monitoring setup
- Asset Optimization: Self-hosted fonts, image optimization, Brotli compression
### Security_implementation
- Security Module: Nuxt-security module integration
- Protection Mechanisms: CSRF protection, CSP headers via Nitro middleware
- Vulnerability Prevention: SQL injection and XSS protection strategies
### Essential_enhancements
- Composition Utilities: VueUse integration
- SEO optimization: meta tags, Open Graph, sitemap, robots.txt
- Content management: Nuxt content setup
- State Management: Pinia with TypeScript interfaces and persistence
- Layout System: Default, error, and specialized layouts (auth, admin etc.)
### Advanced_features
- Internationalization (i18n): multi-language support with detection/switching
- Testing infrastructure: Vitest unit testing, E2E tests with Playwright and API mocking
- CI/CD pipeline: Automated deployment workflow
- Deployment Setup: Docker containerization, environment configurations for Coolify/Hetzner VPS
- Authentication: complete login/registration flows with route protection
- Database: MySQL integration with seeding scripts

## Constraints
Lint zero errors; typecheck zero errors; tests ≥ 95% and pass
No global installs; only repo-defined scripts/tools
No breaking API changes unless version bump planned
No file moves across module boundaries without explicit instruction
Prioritize code quality, bug-free, maintainability, and security
Avoid making assumptions; ask clarifying questions when needed

## Tokenization
3.5ch/token; 8K cap

## Enterprise-grade, future‑proof Nuxt 4 setup (concise best practices)
### Outlined an enterprise Nuxt 4 blueprint
  - Layered architecture, hybrid rendering, Content v3 with schemas, strict typing/validation, security, performance, and TDD/CI.
### Architecture and boundaries
  - Use Nuxt layers to enforce separation of concerns: `core` (base config, composition utilities), `ui` (design system, atomic components with Nuxt UI), `api` (server routes, services, repositories), `content` (Content v3, collections, schemas). Keep domain/business logic in `server/services` with interfaces and DI-like factories, and data access in `server/repositories`.
  - Keep feature modules independent and testable. Expose public APIs (types, composables) at layer boundaries.
### Rendering, caching, and delivery
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
### Content v3 (collections-first)
  - Always define collections in `content.config.ts`; add `zod` schemas for type safety, searchable fields, and consistent frontmatter. Use `queryCollection`, `queryCollectionNavigation`, and `queryCollectionItemSurroundings` per docs.
### State, types, and validation
  - Use Pinia with strict typing and SSR-safe patterns. Keep stores thin; heavy logic belongs to services/composables.
  - Validate all inputs and runtime config via Zod (env, API payloads, query params). Export reusable types and type guards.
### Security and headers
  - `nuxt-security` with strict CSP including nonce (`'nonce-{{nonce}}'`), report-only pipelines first, then enforce. Maintain a `/api/csp-report` with rate limiting.
  - Apply consistent security headers (frame-ancestors, MIME sniffing, referrer policy); keep route-specific exceptions in `routeRules.headers`.
### Performance and costs
  - Follow Nuxt’s performance guide: lazy components (`Lazy*`), lazy hydration, smart prefetch, use `useAsyncData`/`useFetch` to avoid duplicate fetches, and analyze bundles regularly ([docs](https://nuxt.com/docs/4.x/guide/best-practices/performance)).
  - Prefer built-in modules (Image, Fonts, Scripts) over ad‑hoc solutions. Apply caching at Nitro and proxy/CDN layers.
### Testing and CI/CD (TDD)
  - Red–Green–Refactor: write unit tests for composables and services, integration tests around server routes, and E2E with Playwright for critical flows.
  - Enforce 80%+ coverage; run lint, type-check, unit, e2e in CI. Use preview deploys (Coolify) with smoke checks for headers, CSP, and caching.
### Observability and resilience
  - Structured server logging, error boundaries in UI, graceful error handlers in Nitro. Add basic health checks and readiness endpoints; ensure no-cache on health routes.
