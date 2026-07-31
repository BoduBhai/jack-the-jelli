# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project Overview

Jack The Jelli is a lean, zero-op-cost e-commerce storefront + admin dashboard for a leather goods brand, built as a monolithic Next.js App Router app. Public storefront, cart/checkout, and an `/admin` dashboard (orders, inventory) all live in one app.

**Stack:** Next.js 16 (App Router) · React 19 · MongoDB Atlas via Mongoose · Cloudinary (product images) · Tailwind v4 · shadcn/ui (Radix) · custom JWT auth (no NextAuth) — see `docs/phases/1. ARCHITECTURE-PHASES.md` (local-only, gitignored) for the full phase plan.

**Important:** This repo pins a Next.js version ahead of your training data. Before touching routing, `proxy.ts`, config, or server actions, check `node_modules/next/dist/docs/01-app/` — in particular `02-guides/upgrading/version-16.md` and `01-getting-started/16-proxy.md` (Next 16 replaces `middleware.ts` with `proxy.ts`, which this project has not yet added).

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run start    # run production build
npm run lint     # eslint (flat config: eslint-config-next core-web-vitals + typescript)
npx prettier --write .   # format (prettier-plugin-tailwindcss sorts class names; no npm script defined for this)
```

There is no test suite/script configured in `package.json` — don't assume one exists.

## Architecture

**Feature-based, not colocated by route.** `app/` holds only route entrypoints (page/layout files); real component, hook, and data logic lives under `features/<domain>/{components,lib,hooks}` (e.g. `features/admin`, `features/homepage`, `features/products`, `features/cart`, `features/checkout`) and is imported into the thin `app/` pages. When adding a page, put its logic in the matching `features/` folder rather than inline in `app/`.

- `components/ui/` — shadcn primitives only (added via `npx shadcn@latest add <name>`, config in `components.json`, style `radix-nova`). Don't hand-edit these beyond what the CLI generates unless customizing per shadcn conventions.
- `components/layout/` — cross-cutting layout components used outside any one feature (e.g. `ClientFooter`, `Logo`).
- `lib/db.ts` — `connectDB()` Mongoose helper; caches the connection/promise on `global` so it survives dev hot-reloads. No Mongoose models exist yet.
- `lib/utils.ts` — `cn()` (clsx + tailwind-merge), the standard shadcn helper.
- Path alias `@/*` maps to repo root (`tsconfig.json`), matching the `aliases` block in `components.json`.

**Data layer is not built yet.** Admin pages (`app/admin/**`) currently render from static mock arrays in `features/admin/lib/mock-data.ts` and `mock-products.ts` typed by `features/admin/lib/types.ts`. When wiring up real data, add Mongoose models and replace these imports — the mock types are intended to mirror the eventual DB schema.

**Auth is not implemented yet.** The plan (see `docs/phases/`) is custom JWT in an HTTP-only cookie plus a manually-assigned `role` field on the `User` document (no self-service admin signup); `proxy.ts` will gate `/admin` and `/my-orders` once auth lands. Don't assume any existing request is authenticated.

**Design system:** "Quiet Luxury Editorial" — zero border-radius everywhere (`--radius-*` forced to `0` in `app/globals.css`), EB Garamond for display/headings and Inter for body text (loaded via `next/font/google` in `app/layout.tsx` as `--font-garamond` / `--font-inter`, applied with `font-(--font-garamond)` / `font-(--font-inter)` Tailwind utilities). Tailwind v4 is configured entirely in CSS (`@theme inline` block in `app/globals.css`) — there is no `tailwind.config.ts`.

**Env vars** (`.env.local`, gitignored): `MONGODB_URI`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `JWT_SECRET`.

**`docs/`** is gitignored (local planning notes, not shared via git) but present in this checkout — `docs/phases/` has the phase-by-phase build plan, `docs/designs/` has per-page design specs (`DESIGN.md` + reference screenshots) used when building UI to match the intended visuals.
