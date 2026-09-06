# Fitly web

The Next.js web client for Fitly, an AI-assisted virtual clothing try-on product.

## Stack

- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS 4
- Supabase Auth, Postgres, Storage, and Edge Functions
- TanStack Query and Zustand
- Zod and React Hook Form

## Local setup

1. Install dependencies with `bun install`.
2. Copy `.env.example` to `.env.local` and add the Supabase project values.
3. Start the app with `bun dev`.
4. Open `http://localhost:3000`.

## Commands

```bash
bun dev
bun run lint
bun run typecheck
bun run build
```

## Project guidance

Read `AGENTS.md` before changing code. Product and domain context lives in `CONTEXT.md`; visual and interaction rules live in `DESIGN.md`.

The mobile project is a sibling reference for Fitly behavior and language. Web code must use the Next.js architecture documented in this repository.
