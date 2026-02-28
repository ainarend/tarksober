# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TarkSober ("Smart Friend") is an Estonian-language landing page for a brand creating educational apps for Estonian children. Built with Vite + React + TypeScript, scaffolded from Lovable.dev.

## Commands

- `npm run dev` — start dev server (localhost:8080)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run test` — run tests once
- `npm run test:watch` — watch mode tests

## Architecture

**Stack**: React 18, TypeScript (non-strict), Vite 5 (SWC), Tailwind CSS 3.4, shadcn/ui, react-router-dom v6, TanStack Query v5.

**Path alias**: `@/` maps to `src/`.

**Routing**: BrowserRouter in `App.tsx` with `<Routes>`. Pages live in `src/pages/`.

**Provider tree** (App.tsx): QueryClientProvider → TooltipProvider → Toaster → Sonner → BrowserRouter → Routes.

**Component organization**:
- `src/components/ui/` — shadcn/ui primitives (generated, treat as library code)
- `src/components/` — custom app components
- `src/pages/` — route page components
- `src/hooks/` — custom React hooks
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)

**Design tokens**: All colors are HSL CSS variables defined in `src/index.css` (`:root` and `.dark`). Tailwind config references these variables. Key brand colors: primary (indigo), accent (warm amber).

## Testing

Vitest with jsdom, `@testing-library/react`, and `@testing-library/jest-dom`. Globals enabled (no need to import `describe`/`it`/`expect`). Setup file at `src/test/setup.ts`. Test files use pattern `src/**/*.{test,spec}.{ts,tsx}`.

## Conventions

- All user-facing text is in **Estonian**
- shadcn/ui components are added via the shadcn CLI and configured in `components.json`
- Dark mode supported via `next-themes` with CSS class strategy
- TypeScript strict mode is OFF; `noImplicitAny` is false
