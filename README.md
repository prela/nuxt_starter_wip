# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Quality Assurance (QA)

This project enforces strict quality gates: lint, type-check, unit/integration tests, E2E tests, and coverage thresholds.

### Commands

```bash
# Lint (expects 0 errors)
pnpm lint

# Type-check (expects 0 errors)
pnpm type-check

# Unit & integration tests (Vitest)
pnpm test:unit

# E2E tests (Playwright, builds then runs against preview)
pnpm test:e2e

# Coverage (Vitest v8 provider)
pnpm test:coverage

# Full CI quality pipeline
pnpm ci:quality
```

### Acceptance Criteria

- Type-check: 0 errors
- Lint: 0 errors
- Tests: all pass (Vitest + Playwright)
- Coverage: thresholds met or exceeded
  - lines ≥ 80%, functions ≥ 80%, branches ≥ 75%, statements ≥ 80%

### Current Coverage Baseline

Example (as of last run):

```
All files: lines 95.47%, functions 80.00%, branches 91.48%, statements 95.47%
```

### Notes

- Playwright runs against a production build (`pnpm build && pnpm preview`) to surface production-only issues.
- Route rules/caching are verified in E2E; header assertions tolerate preview differences when applicable.
