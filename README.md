# Financial Healthcheck

A pnpm monorepo for assessing financial wellness. Shared types flow from a common package through an Express API to a React frontend.

## Stack

| Package | Tech |
|---------|------|
| `packages/shared` | TypeScript types and constants |
| `apps/api` | Node.js, Express, Vitest, ESLint |
| `apps/web` | Vite, React, TypeScript, React Query, TanStack Table, shadcn/ui, Tailwind v4, Vitest, Playwright |

## Project structure

```
├── apps/
│   ├── api/          Express API (port 3001)
│   └── web/          Vite + React frontend (port 5173)
├── packages/
│   └── shared/       Shared types (@financial-healthcheck/shared)
└── .cursor/rules/    Feature development workflow
```

## Prerequisites

- Node.js 20.19+ or 22.12+
- pnpm 9 (`corepack enable` or `npx pnpm@9.15.9`)

## Getting started

```bash
pnpm install
pnpm dev
```

- Web: http://localhost:5173
- API: http://localhost:3001

The Vite dev server proxies `/api` requests to the API.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start API and web in parallel |
| `pnpm build` | Build all packages |
| `pnpm test` | Run unit tests (API + web) |
| `pnpm test:e2e` | Run Playwright E2E tests |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |

Filter to a single package:

```bash
pnpm --filter @financial-healthcheck/api test
pnpm --filter @financial-healthcheck/web test:unit
pnpm --filter @financial-healthcheck/web test:e2e
```

### Playwright setup

On first run, install browser binaries:

```bash
cd apps/web && pnpm exec playwright install chromium
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/healthcheck` | Mock healthcheck result |

## Development workflow

Features are built incrementally:

1. **Schema types** — `packages/shared/src/types/`
2. **API logic, routes, tests** — `apps/api/src/`
3. **Frontend components + unit tests** — `apps/web/src/components/`
4. **Frontend routes** — `apps/web/src/pages/`
5. **E2E tests** — `apps/web/tests/e2e/`

See `.cursor/rules/feature-development-workflow.mdc` for full details.

## Testing

| Layer | Location | Runner |
|-------|----------|--------|
| API | `apps/api/src/**/*.test.ts` | Vitest + supertest |
| Web unit | `apps/web/src/**/*.test.tsx` | Vitest + React Testing Library |
| Web E2E | `apps/web/tests/e2e/` | Playwright |

Component tests use `renderWithProviders` from `apps/web/src/test/test-utils.tsx` for React Query setup.
