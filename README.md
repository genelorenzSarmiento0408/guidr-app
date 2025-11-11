# guidr — Developer README

This repository hosts a Next.js (App Router) + TypeScript + Tailwind project that uses Supabase for auth and data. The goal of this README is to get a co-developer up and running quickly and explain the project's structure, environment, and developer workflows.

## Quick start (development)

Open a PowerShell terminal and run:

```powershell
# install dependencies (npm chosen as default)
npm install

# start dev server (Next.js App Router)
npm run dev

# open http://localhost:3000
```

If you prefer pnpm or yarn, replace `npm` with your package manager of choice.

## Required environment variables

Create a `.env.local` in the project root with the following values (example names used in this repo):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
# Optional (server-side service role key for migrations/scripts)
SUPABASE_SERVICE_ROLE_KEY=service-role-key
# If you run Supabase Edge Functions or a functions host, point to it here (optional)
NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL=https://your-functions-host
```

Keep secrets out of source control. When deploying (Vercel, Netlify, etc.), set these values in the platform's environment settings.

## Project layout (important files)

- `app/` - Next.js App Router pages and layouts (server components by default).
- `src/components/` - React client components used by pages.
- `src/lib/supabase/` - Supabase client setup:
  - `client.ts` — browser/CSR client for client components
  - `server.ts` — server-side Supabase client for Server Components and API routes
  - `middleware.ts` — helpers for cookie/session handling
- `middleware.ts` - Next.js middleware for edge session handling / auth
- `supabase/functions/` - Supabase Edge Functions (e.g., `moderate-image`)
- `supabase/migrations/` - SQL migrations used to create/alter the database

When editing pages with server-side data, prefer Server Components unless you need client-only behavior; mark client components with `"use client"` at the top.

## Supabase notes

- Auth: The app integrates Supabase Auth (OAuth + email). Session cookies are managed in server middleware.
- Database: The schema (profiles, posts, saved_profiles, etc.) lives under `supabase/migrations`.
- Edge functions: Image moderation is under `supabase/functions/moderate-image/index.ts` and is invoked during image uploads.

If you need to run Supabase locally, install the Supabase CLI and follow their local development docs. Migrations are plain SQL files in `supabase/migrations`.

## Common developer tasks

- Run linting and formatting

```powershell
npm run lint
npm run format
```

- Run type checks

```powershell
npm run typecheck
```

- Run tests (if added)

```powershell
npm test
```

## Images and performance

Several components use `<img>` tags for simplicity. For better LCP and automatic optimization, consider migrating heavy or public images to Next.js `<Image />` with an appropriate loader or remote image configuration in `next.config.ts`.

## Troubleshooting

- "Cannot find module '@/components/...'": ensure your editor/TS server has reloaded. Run `npm run dev` once — Next.js sometimes triggers TS resolution on start.
- TypeScript errors after moving files: run `npm run typecheck` to see the full list. Ensure `tsconfig.json` has `baseUrl`/`paths` aligned with `@/` alias.
- Environment variables not applied: restart the dev server after editing `.env.local`.

## Testing and validation

If you add unit or integration tests, prefer Jest or Vitest consistent with the repo. Add a small CI job (GitHub Actions) that runs:

```yml
# example: run lint + typecheck + tests
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install
        run: npm ci
      - name: Lint
        run: npm run lint --if-present
      - name: Typecheck
        run: npm run typecheck --if-present
      - name: Test
        run: npm test --if-present
```

## Contribution workflow

- Branch from `master` for feature/bugfix: `feature/your-short-name` or `fix/description`.
- Open a pull request with a short description and testing notes.
- Keep PRs small and focused; run `npm run lint` and `npm run typecheck` locally before pushing.

## Notes & follow-ups (things you may want to do next)

- Replace key `<img>` usages with Next.js `<Image />` for optimized delivery.
- Add a lightweight test suite covering auth flows and the matching algorithm.
- Add an automated deployment pipeline (Vercel is recommended for Next.js App Router apps).

---

If anything above is unclear, open an issue or ping me on the PR and include the failing logs or TypeScript output. Welcome aboard — happy hacking!
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
