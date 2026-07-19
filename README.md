# ProductiveLeadership

Executive coaching and leadership development website built with Next.js 16 (App Router), JavaScript, and Tailwind CSS v4.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 App Router (`src/app/`) |
| Language | JavaScript |
| Styling | Tailwind CSS v4 + CSS variables in `src/app/globals.css` |
| Auth | [Clerk](https://clerk.com) (`@clerk/nextjs` v7) |
| CMS | [Prismic](https://prismic.io) (`@prismicio/client`, Slice Machine) |
| Database | [Neon](https://neon.tech) Postgres via `@neondatabase/serverless` |
| ORM / migrations | [Drizzle ORM](https://orm.drizzle.team) + `drizzle-kit` |
| Deployment | [Vercel](https://vercel.com) with Neon Storage integration |

## Getting started

### Prerequisites

- Node.js **24.x** (see `.nvmrc`; minimum **20.9+** for Next.js 16; Vercel deploys use 24.x by default)
- Yarn 1.x
- Clerk account ([dashboard.clerk.com](https://dashboard.clerk.com))
- Neon database (via Vercel Storage or [console.neon.tech](https://console.neon.tech))

### 1. Install dependencies

```bash
yarn install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and replace placeholder values with your real keys:

```bash
cp .env.example .env.local   # skip if .env.local already exists
```

See [Environment variables](#environment-variables) below for what each variable does.

### 3. Run database migrations (local)

After `DATABASE_URL` is set in `.env.local`:

```bash
yarn db:migrate
```

### 4. Start the dev server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/                    # App Router pages and layouts
    dashboard/            # Protected route (requires sign-in)
    sign-in/              # Clerk sign-in
    sign-up/              # Clerk sign-up
  actions/                # Server Actions (mutations, data writes)
  components/
    atoms/                # Primitives (Button, Input, Textarea, Eyebrow)
    molecules/            # Compositions (NavLink, Logo, StatCard, AuthNav, ...)
    organisms/            # Page sections (Header, Hero, Services, About, ...)
  db/
    schema.js             # Drizzle table definitions
    migrations/           # SQL migrations (committed to git)
  lib/
    db.js                 # Drizzle + Neon client
    db-context.js         # Resolves active Neon branch at runtime
    clerk-appearance.js   # Clerk UI theming
  proxy.js                # Clerk auth middleware (Next.js 16 proxy)
scripts/
  migrate.mjs             # Runs migrations on build / manually
  neon-branch.mjs         # Local per-git-branch Neon workflow helper
```

## Implementation notes

### Next.js App Router + Tailwind

- Pages live under `src/app/` using the App Router (not the Pages Router).
- Tailwind v4 is configured via `@import "tailwindcss"` in `src/app/globals.css`.
- Theme tokens (`background`, `foreground`, `primary`, `accent`, etc.) are defined as CSS variables with light and dark values via `prefers-color-scheme: dark`.
- Fonts: Geist Sans and Geist Mono via `next/font/google` in `src/app/layout.js`.

**Additional actions:** None required for local development. Deploy to Vercel when ready (see [Deployment](#deployment)).

---

### Cursor rules (AI / team conventions)

Project conventions for Cursor and contributors live in `.cursor/rules/`:

| Rule file | Purpose |
|-----------|---------|
| `package-usage.mdc` | Approved stack map — which packages to use; avoid overlapping libraries |
| `atomic-components.mdc` | Organize UI as atoms / molecules / organisms; reuse before creating new components |
| `radix-ui.mdc` | Radix primitives for forms, dialogs, menus, tabs, and other interactive UI |
| `zod-forms.mdc` | Zod schemas in `src/lib/schemas/`; validate `FormData` in Server Actions |
| `server-actions.mdc` | All form submissions and mutations via `src/actions/` + `useActionState` |
| `user-data-authorization.mdc` | Scope user-owned DB queries by Clerk ID / role; staff cross-user only on admin pages |
| `dark-mode-ui.mdc` | All new UI must support light and dark mode via semantic tokens in `globals.css` |

**Additional actions:**

- When adding components, follow the atomic folder layout (`src/components/atoms/Button/Button.js`, etc.).
- After creating a component, check whether existing atoms/molecules can be reused or consolidated.
- New forms: Radix fields → Zod validation in the action → `useActionState` on the form (`server-actions.mdc`).

---

### Clerk authentication

Clerk handles sign-in, sign-up, and session management.

**What is implemented**

| Item | Location |
|------|----------|
| `ClerkProvider` | `src/app/layout.js` |
| Auth middleware | `src/proxy.js` (Next.js 16 uses `proxy.js`, not `middleware.ts`) |
| Sign-in / sign-up pages | `src/app/sign-in/`, `src/app/sign-up/` |
| Header auth controls | `src/components/molecules/AuthNav/AuthNav.js` |
| Protected route example | `src/app/dashboard/page.js` |
| Sync Clerk user → Neon | `src/lib/users.js` + `src/app/dashboard/layout.js` |
| Branded Clerk UI | `src/lib/clerk-appearance.js` |

**Route access**

| Route | Access |
|-------|--------|
| `/`, `/sign-in`, `/sign-up`, `/[uid]`, `/slice-simulator` | Public |
| `/dashboard` | Protected (redirects to sign-in if unauthenticated) |

After sign-in / sign-up, Clerk redirects to `/dashboard`. The dashboard layout calls `ensureAppUser`, which inserts the Clerk user into `users` (with the `default` role) if they are not already present.

**Additional actions (required before auth works)**

1. Create a Clerk application at [dashboard.clerk.com](https://dashboard.clerk.com).
2. Add keys to `.env.local` (or pull them with the Clerk CLI):

   ```bash
   npx clerk auth login
   npx clerk env pull
   ```

3. In the Clerk Dashboard, configure allowed redirect URLs for your environments:
   - Local: `http://localhost:3000`
   - Production: your Vercel domain
4. Optional: customize sign-in methods, social providers, and branding in the Clerk Dashboard.

**Note:** Clerk v7 uses `useAuth`, `SignInButton`, and `UserButton` — not the deprecated `SignedIn` / `SignedOut` components.

---

### Neon database (Vercel per-branch)

Postgres is provided by Neon. The app uses **one isolated Neon database branch per Vercel preview deployment** when preview branching is enabled.

**What is implemented**

| Item | Location |
|------|----------|
| Schema | `src/db/schema.js` — `user_roles`, `users` tables |
| Migrations | `src/db/migrations/` |
| DB client | `src/lib/db.js` |
| Branch context | `src/lib/db-context.js` — reads active Neon branch name at runtime |
| Dashboard DB info | `src/app/dashboard/page.js` shows Neon branch, git branch, and environment |
| Auto-migrate on build | `yarn build` runs `scripts/migrate.mjs` first |

**How per-branch works**

| Environment | Database branch |
|-------------|-----------------|
| Vercel Production | Neon production branch |
| Vercel Preview | Neon creates `preview/<git-branch>` per deployment |
| Local | Point `DATABASE_URL` at a Neon branch for your current git branch |

On each Vercel preview deploy, Neon receives a webhook, creates a copy-on-write branch, and injects `DATABASE_URL` for that deployment only. Migrations run during the build step so schema matches the code on every branch.

**Additional actions (required for database)**

#### On Vercel (recommended)

1. Open your Vercel project → **Storage** → install **Neon Postgres** ([Vercel Marketplace](https://vercel.com/marketplace/neon)).
2. Connect the database to this project for **Development**, **Preview**, and **Production**.
3. Under **Deployments Configuration** (Advanced Options):
   - Enable **Preview** — creates a Neon branch per preview deployment.
   - Enable **Resource must be active before deployment** — waits for the branch to be ready.
4. Deploy. Vercel injects `DATABASE_URL` and `DATABASE_URL_UNPOOLED` automatically; you do not add these manually in the Vercel env UI for previews.

   Docs: [Vercel-Managed Neon integration](https://neon.com/docs/guides/vercel-managed-integration)

#### Local development

1. Create a Neon project (or use the one Vercel provisions).
2. For per-branch local work, align your git branch with a Neon branch:

   ```bash
   yarn db:branch
   ```

   This prints the suggested Neon branch name for your current git branch.

3. Create that branch in the [Neon Console](https://console.neon.tech) or via the Neon CLI, then copy its connection string into `.env.local` as `DATABASE_URL`.
4. Run migrations:

   ```bash
   yarn db:migrate
   ```

#### Schema changes

When you change `src/db/schema.js`:

```bash
yarn db:generate    # create a new migration file
yarn db:migrate     # apply locally
git add src/db/migrations/
git commit
```

Preview and production deploys will run migrations automatically via the build script.

**Optional:** Open Drizzle Studio to inspect data locally:

```bash
yarn db:studio
```

---

### Prismic CMS

Content is managed in [Prismic](https://prismic.io) using Slice Machine. The homepage and additional pages are built from reusable slices.

**What is implemented**

| Item | Location |
|------|----------|
| Prismic client | `src/prismicio.js` |
| Slice Machine config | `slicemachine.config.json` |
| Custom types | `customtypes/homepage/` (single), `customtypes/page/` (repeatable), `customtypes/settings/` (site-wide fallbacks) |
| SEO helper | `src/lib/prismic-seo.js` |
| Site settings helper | `src/lib/prismic-settings.js` |
| Slices | `src/slices/` — all layout components (see below) |
| Homepage (CMS-driven) | `src/app/page.js` — falls back to static components if Prismic is unavailable |
| Dynamic pages | `src/app/[uid]/page.js` |
| Slice simulator | `src/app/slice-simulator/page.js` |
| Preview endpoints | `src/app/api/preview/`, `src/app/api/exit-preview/` |
| Revalidation webhook | `src/app/api/revalidate/` |
| Preview toolbar | `PrismicPreview` in `src/app/layout.js` |

**Custom types**

| Type | API ID | Repeatable | Route |
|------|--------|------------|-------|
| Homepage | `homepage` | No (single type) | `/` |
| Page | `page` | Yes | `/:uid` |
| Settings | `settings` | No (single type) | — (not routed) |

**Settings** (single type) stores site-wide fallbacks used when page-level SEO fields are empty:

| Tab | Fields |
|-----|--------|
| Site identity | Site name, title postfix, tagline, logo text/accent |
| SEO fallbacks | Default meta title/description/image, OG title/description, site URL, Twitter handle, Google verification |
| Contact & header | Contact email/phone, header CTA label/link, footer copyright |
| Social | Repeatable social links (platform + URL) |

**Shared fields**

| Field | Homepage | Page |
|-------|----------|------|
| Title | Yes | Yes |
| Slug (`uid`) | No | Yes |
| Slice zone | Yes | Yes |
| SEO title | Yes | Yes |
| SEO description | Yes | Yes |
| OG title / description | Yes | Yes |
| OG image (`meta_image`) | Yes | Yes |
| Canonical URL | Yes | Yes |
| No index | Yes | Yes |

**Slice types** (available in both custom types)

| Slice | Purpose |
|-------|---------|
| `hero` | Headline, CTAs, stats |
| `services` | Services grid |
| `about` | About section with highlights |
| `media` | 16:9 image or video |
| `text_image` | 50/50 text and image |
| `listing` | 3-column responsive card listing |
| `section_intro` | Centered title, subtitle, text, link |
| `rich_text` | Full-width rich text |

**Additional actions (required for CMS)**

1. Create a Prismic repository at [prismic.io/dashboard](https://prismic.io/dashboard) → **Next.js** → **Connect your own web app**.
2. Set your repository name in `slicemachine.config.json` and `.env.local`:

   ```bash
   PRISMIC_REPOSITORY=your-repo-name
   ```

3. Push custom types and slices to Prismic:

   ```bash
   yarn slicemachine
   ```

   In Slice Machine, click **Push** to sync models to your repository.

4. Create and publish content in Prismic:
   - **Settings** (single type) — site-wide fallbacks (SEO, branding, contact, social)
   - **Homepage** (single type) — one document for `/`
   - **Page** (repeatable) — additional pages at `/{slug}`

5. Configure previews (local):

   ```bash
   npx prismic preview add http://localhost:3000/api/preview
   npx prismic preview set-simulator http://localhost:3000/slice-simulator
   ```

6. Configure revalidation webhook in Prismic (**Settings → Webhooks**):
   - URL: `https://your-domain.com/api/revalidate`
   - Triggers: document published / unpublished
   - Optional: set `PRISMIC_WEBHOOK_SECRET` in Vercel and Prismic webhook headers

7. If your Prismic API is private, generate an access token and set `PRISMIC_ACCESS_TOKEN` in `.env.local` and Vercel.

**Note:** Until Prismic is configured and content is published, the site uses static fallback components automatically.

---

## Environment variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key (server only) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Yes | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Yes | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` | Yes | Redirect after sign-in (default: `/dashboard`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` | Yes | Redirect after sign-up (default: `/dashboard`) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Yes | Fallback redirect after sign-in |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Yes | Fallback redirect after sign-up |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Recommended | Legacy Clerk redirect (keep in sync with FORCE URL) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Recommended | Legacy Clerk redirect (keep in sync with FORCE URL) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL` | Recommended | Redirect after sign-out (default: `/`) |
| `CLERK_WEBHOOK_SECRET` | Optional | Only if using Clerk webhooks |
| `DATABASE_URL` | Yes (for DB features) | Pooled Neon connection string |
| `DATABASE_URL_UNPOOLED` | Recommended | Direct connection (used for migrations) |
| `NEON_PROJECT_ID` | Optional | Neon project ID for CLI branch workflow |
| `NEON_API_KEY` | Optional | Neon API key for CLI branch workflow |
| `PRISMIC_REPOSITORY` | Yes (for CMS) | Prismic repository name |
| `PRISMIC_ACCESS_TOKEN` | Optional | Required if Prismic API is private |
| `PRISMIC_WEBHOOK_SECRET` | Optional | Validates `/api/revalidate` webhook calls |
| `VERCEL_ENV`, `VERCEL_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_GIT_COMMIT_REF` | Auto | Injected by Vercel at deploy time (do not set locally). Cookiebot CMP loads only when `VERCEL_ENV=production` and the production host is `www.productiveleadership.org` (or apex). |

On Vercel, Clerk keys must be added manually in **Project Settings → Environment Variables**. Neon `DATABASE_URL` values are injected by the Storage integration.

**Never commit `.env.local` or secrets.** `.env.example` is safe to commit (placeholders only).

---

## NPM scripts

| Script | Description |
|--------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Run migrations, then production build |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `yarn db:generate` | Generate Drizzle migration from schema changes |
| `yarn db:migrate` | Apply migrations to the database in `DATABASE_URL` |
| `yarn db:branch` | Show git branch → suggested Neon branch name |
| `yarn db:studio` | Open Drizzle Studio |
| `yarn slicemachine` | Start Slice Machine UI to edit models and push to Prismic |

---

## Deployment checklist

Before going live, confirm:

- [ ] Clerk application created and keys set in Vercel env vars
- [ ] Clerk redirect URLs include your production domain
- [ ] Neon Postgres connected via Vercel Storage
- [ ] Preview branching enabled for isolated preview databases
- [ ] `DATABASE_URL` available in Production (via Neon integration)
- [ ] First deploy completes successfully (`yarn build` runs migrations)
- [ ] Sign-in, sign-up, and dashboard tested on preview and production
- [ ] Prismic repository created and `PRISMIC_REPOSITORY` set in Vercel
- [ ] Custom types and slices pushed via Slice Machine
- [ ] Homepage published in Prismic
- [ ] Preview and revalidation webhooks configured for production domain

---

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Next.js Quickstart](https://clerk.com/docs/nextjs/getting-started/quickstart)
- [Neon + Vercel integration](https://neon.com/docs/guides/vercel-managed-integration)
- [Drizzle ORM docs](https://orm.drizzle.team/docs/overview)
- [Prismic + Next.js docs](https://prismic.io/docs/nextjs)
