# ProductiveLeadership

This Next.js app lives in `app/` of the repo. From the repository root:

```bash
cd app
yarn install
yarn dev
```

Standalone Sanity Studio is `../studio-productive-leadership/`. On Vercel, set the project **Root Directory** to `app`.

Executive coaching and leadership development website built with Next.js 16 (App Router), JavaScript, and Tailwind CSS v4. Marketing pages are CMS-driven. Signed-in users take leadership assessments stored in Neon Postgres.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 App Router (`src/app/`) |
| Language | JavaScript |
| Styling | Tailwind CSS v4 + CSS variables in `src/app/globals.css` |
| Auth | [Clerk](https://clerk.com) (`@clerk/nextjs` v7) |
| CMS | [Sanity](https://www.sanity.io) (`next-sanity`; standalone Studio in `studio-productive-leadership/`, embed at `/studio`) |
| Database | [Neon](https://neon.tech) Postgres via `@neondatabase/serverless` |
| ORM / migrations | [Drizzle ORM](https://orm.drizzle.team) + `drizzle-kit` |
| Charts | [Recharts](https://recharts.org) (leadership profile radar, domain averages) |
| PDF export | [`@react-pdf/renderer`](https://react-pdf.org) |
| Drag and drop | [`@dnd-kit`](https://dndkit.com) (assessment structure builder) |
| Analytics | `@vercel/analytics` + `@vercel/speed-insights` |
| Deployment | [Vercel](https://vercel.com) with Neon Storage integration |

## Getting started

### Prerequisites

- Node.js **24.x** (see `.nvmrc`; minimum **20.9+** for Next.js 16; Vercel deploys use 24.x by default)
- Yarn 1.x
- Clerk account ([dashboard.clerk.com](https://dashboard.clerk.com))
- Neon database (via Vercel Storage or [console.neon.tech](https://console.neon.tech))
- Sanity project ([sanity.io/manage](https://www.sanity.io/manage))

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

`DATABASE_URL` should be the **pooled** Neon URL (`…-pooler…`). `DATABASE_URL_UNPOOLED` should be the **direct** host (same hostname with `-pooler` removed). Migrations use the unpooled URL when it is set.

### 3. Run database migrations (local)

After `DATABASE_URL` is set in `.env.local`:

```bash
yarn db:migrate
```

### 4. Start the dev server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). Restart the dev server after changing `.env.local`. The embedded Studio is at [http://localhost:3000/studio](http://localhost:3000/studio). Prefer the standalone Studio:

```bash
cd ../studio-productive-leadership
npm install
npm run dev
```

That opens [http://localhost:3333](http://localhost:3333).

## Project structure

```
src/
  app/                    # App Router pages and layouts
    dashboard/            # Signed-in app (assessments, account, staff tools)
      assessments/        # Take, past submissions, overall averages
      questions/          # super_admin assessment template builder
      users/              # Staff user management + Clerk wait list
    sign-in/              # Clerk sign-in
    sign-up/              # Clerk sign-up
    studio/               # Embedded Sanity Studio
    api/                  # Webhooks and export routes (not form mutations)
  actions/                # Server Actions (mutations, data writes)
  components/
    atoms/                # Primitives (Button, Input, Checkbox, ScoreRadioGroup, …)
    molecules/            # Compositions (NavLink, AuthNav, Dialog, …)
    organisms/            # Page sections and feature UIs (Header, TakeAssessmentForm, …)
  db/
    schema.js             # Drizzle table definitions
    migrations/           # SQL migrations (committed to git)
  lib/
    db.js                 # Drizzle + Neon client
    db-context.js         # Resolves active Neon branch at runtime
    users.js              # Clerk session → app user, roles, wait list
    assessments.js        # Assessment templates, submissions, averages
    clerk-appearance.js   # Clerk UI theming
    site-settings.js      # Sanity settings adapter
    site-seo.js           # Sanity SEO adapter
    header-menu.js        # Role-gated nav from Sanity
  sanity/
    env.js                # Project ID, dataset, API version
    lib/                  # Client, GROQ queries, image URL builder
    schemaTypes/          # Documents and page-builder slices
    structure.js          # Studio desk structure
  slices/                 # Page-builder slice components
  proxy.js                # Clerk auth middleware (Next.js 16 proxy)
sanity.config.js          # Embedded Studio config
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
| `delete-confirmations.mdc` | Deletes go through a Radix Alert Dialog, not a single click |
| `page-layouts.mdc` | Shared `Container` / `Section` / `RichText` patterns |
| `grid-first-layout.mdc` | 12-column CSS Grid for page structure; flex only in small components |
| `env-example.mdc` | Keep `.env.example` in sync when adding or renaming env vars |
| `sanity-cms.mdc` | Sanity Studio, schemas, GROQ, and revalidation |

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
| Protected app | `src/app/dashboard/` (layout calls `requireEnabledAppUser`) |
| Sync Clerk user → Neon | `src/lib/users.js` (`ensureAppUser` / `getCurrentAppUser`) |
| Roles | `default`, `admin`, `super_admin` in `user_roles` |
| Staff user management | `/dashboard/users` (`requireStaffAppUser`) |
| Clerk wait list | `/dashboard/users/waitlist` (accept / deny) |
| Assessment builder | `/dashboard/questions` (`requireSuperAdminAppUser`) |
| Purge user data on Clerk delete | `src/app/api/webhooks/clerk/` + `deleteAppUserDataByClerkId` |
| Branded Clerk UI | `src/lib/clerk-appearance.js` |

**Route access**

| Route | Access |
|-------|--------|
| `/`, `/sign-in`, `/sign-up`, `/[uid]`, `/studio` | Public (`/studio` still requires a Sanity login) |
| `/dashboard`, `/dashboard/assessments/*` | Signed-in and enabled (`users.enabled`) |
| `/dashboard/users`, `/dashboard/users/waitlist` | `admin` or `super_admin` |
| `/dashboard/questions` | `super_admin` only |

Disabled accounts are sent to the CMS Account disabled page. After sign-in / sign-up, Clerk redirects to `/dashboard`. The dashboard layout ensures a `users` row (with the `default` role) if the Clerk user is not already present.

`admin` can manage `default` and `admin` users, but cannot edit or assign `super_admin`. Header menu visibility is cascading (`Public` → `default` → `admin` → `super_admin`).

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
4. Optional: customize sign-in methods, social providers, branding, and the wait list in the Clerk Dashboard.
5. Optional but recommended for account deletion: **Webhooks → Add Endpoint**
   - URL: `https://your-domain.com/api/webhooks/clerk`
   - Subscribe to: `user.deleted`
   - Copy the Signing Secret into `CLERK_WEBHOOK_SIGNING_SECRET` (`.env.local` / Vercel)

**Note:** Clerk v7 uses `useAuth`, `SignInButton`, and `UserButton` — not the deprecated `SignedIn` / `SignedOut` components.

---

### Assessments

Leadership assessments live in Neon, not Sanity. Super-admins build templates; signed-in users take them and can opt completed submissions into an overall average.

**What is implemented**

| Item | Location |
|------|----------|
| Schema | `assessments`, `assessment_domains`, `assessment_attributes`, `assessment_statements`, `assessment_submissions`, `assessment_overall_averages` |
| Queries / scoring | `src/lib/assessments.js`, `src/lib/assessment-scores.js` |
| Mutations | `src/actions/assessments.js` |
| Take / continue | `/dashboard` cards → `/dashboard/assessments` |
| Past submissions | `/dashboard/assessments/past` |
| Completed results | `/dashboard/assessments/submissions/[id]` (radar chart, PDF, CSV) |
| Overall average | `/dashboard/assessments/average` (opted-in submissions only) |
| Template builder | `/dashboard/questions` (drag-and-drop domains / attributes / statements) |

Templates have status `draft`, `available`, or `archived`, plus a frequency (`daily` / `weekly` / `monthly` / `yearly`). Users start or continue one in-progress submission per available template. Answers are scores 1–5. Completing a submission stores domain and attribute averages; opting in refreshes the cached overall average for that template.

Submissions are scoped to the signed-in Clerk user unless the caller is staff on an admin surface.

---

### Neon database (Vercel per-branch)

Postgres is provided by Neon. The app uses **one isolated Neon database branch per Vercel preview deployment** when preview branching is enabled.

**What is implemented**

| Item | Location |
|------|----------|
| Schema | `src/db/schema.js` — roles, users, assessment templates, submissions, overall averages |
| Migrations | `src/db/migrations/` |
| DB client | `src/lib/db.js` |
| Branch context | `src/lib/db-context.js` — reads active Neon branch name at runtime |
| Dashboard DB info | Super-admin Danger Zone on `/dashboard` shows Neon branch, git branch, and environment |
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

3. Create that branch in the [Neon Console](https://console.neon.tech) or via the Neon CLI, then copy its connection strings into `.env.local`:
   - `DATABASE_URL` — pooled host (`ep-…-pooler.…`)
   - `DATABASE_URL_UNPOOLED` — direct host (omit `-pooler`)
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

### Sanity CMS

Content is managed in [Sanity](https://www.sanity.io). The homepage and additional pages are built from reusable page-builder slices. Prefer the standalone Studio in `studio-productive-leadership/` (`npm run dev` → http://localhost:3333). An embed also remains at `/studio`. Assessment data is not stored in Sanity.

**What is implemented**

| Item | Location |
|------|----------|
| Sanity client | `src/sanity/lib/client.js` |
| Studio config | `sanity.config.js`, `src/sanity/env.js` |
| Schemas | `src/sanity/schemaTypes/` — homepage, page, settings, header menu, slices |
| SEO helper | `src/lib/site-seo.js` |
| Site settings helper | `src/lib/site-settings.js` |
| Header menu | `src/lib/header-menu.js` (role-gated links) |
| Slices | `src/slices/` — rendered by `SliceZone` |
| Homepage (CMS-driven) | `src/app/page.js` — falls back to static components if Sanity is unavailable |
| Dynamic pages | `src/app/[uid]/page.js` |
| Studio | `src/app/studio/` |
| Revalidation webhook | `src/app/api/revalidate/` |

**Document types**

| Type | Repeatable | Route |
|------|------------|-------|
| Homepage | No (singleton `homepage`) | `/` |
| Page | Yes (`slug`) | `/:uid` |
| Settings | No (singleton `settings`) | — (not routed) |
| Header menu | No (singleton `headerMenu`) | — (nav links + required role) |

**Settings** stores site-wide fallbacks used when page-level SEO fields are empty:

| Group | Fields |
|-------|--------|
| Site identity | Site name, title postfix, tagline, logo text/accent |
| SEO fallbacks | Default meta title/description/image, OG title/description, site URL, Twitter handle, Google verification |
| Contact & header | Contact email/phone, header CTA, footer copyright |
| Social | Repeatable social links (platform + URL) |
| Account access | Account disabled page, dashboard introduction text |

**Slice types** (available on homepage and pages)

| Slice | Purpose |
|-------|---------|
| `hero` | Headline, CTAs, stats |
| `about` | About section with highlights |
| `media` | 16:9 image or video |
| `textImage` | 50/50 text and image |
| `listing` | 3-column responsive card listing |
| `sectionIntro` | Centered title, subtitle, text, link |
| `richText` | Full-width rich text |

**Additional actions (required for CMS)**

1. Create a Sanity project at [sanity.io/manage](https://www.sanity.io/manage).
2. Set these in `.env.local` and Vercel:

   ```bash
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   ```

3. Add CORS origins in the Sanity project (**API → CORS Origins**): `http://localhost:3000` and the production site URL, with credentials allowed.
4. Open the standalone Studio at http://localhost:3333 (or `/studio`), sign in, and create the singleton documents **Homepage**, **Settings**, and **Header menu**, plus any **Pages**.
5. Configure a revalidation webhook in Sanity (**API → Webhooks**):
   - URL: `https://your-domain.com/api/revalidate`
   - Trigger on create / update / delete
   - Set `SANITY_WEBHOOK_SECRET` in Vercel and send the same value as `?secret=`, in the JSON body, or header `x-sanity-webhook-secret`

**Note:** Until Sanity is configured and content is published, the site uses static fallback components automatically. `NEXT_PUBLIC_SANITY_PROJECT_ID` must match `/^[a-z0-9-]+$/` or the client is not created.

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
| `CLERK_WEBHOOK_SIGNING_SECRET` | Optional | Clerk webhook signing secret for `/api/webhooks/clerk` (`user.deleted` purge) |
| `DATABASE_URL` | Yes (for DB features) | Pooled Neon connection string (`…-pooler…`) |
| `DATABASE_URL_UNPOOLED` | Recommended | Direct connection (no `-pooler`; used for migrations) |
| `NEON_PROJECT_ID` | Optional | Neon project ID for CLI branch workflow |
| `NEON_API_KEY` | Optional | Neon API key for CLI branch workflow |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Yes (for CMS) | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Yes (for CMS) | Sanity dataset (usually `production`) |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Optional | GROQ API version (defaults in `src/sanity/env.js`) |
| `SANITY_WEBHOOK_SECRET` | Optional | Validates `/api/revalidate` webhook calls |
| `VERCEL_ENV`, `VERCEL_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_GIT_COMMIT_REF` | Auto | Injected by Vercel at deploy time (do not set locally). Cookiebot CMP loads only when `VERCEL_ENV=production` and the production host is `www.productiveleadership.org` (or apex). |

On Vercel, Clerk keys must be added manually in **Project Settings → Environment Variables**. Neon `DATABASE_URL` values are injected by the Storage integration.

**Never commit `.env.local` or secrets.** `.env.example` is safe to commit (placeholders only).

---

## NPM scripts

| Script | Description |
|--------|-------------|
| `yarn dev` | Start development server (includes `/studio`) |
| `yarn build` | Run migrations, then production build |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `yarn db:generate` | Generate Drizzle migration from schema changes |
| `yarn db:migrate` | Apply migrations to the database in `DATABASE_URL` |
| `yarn db:branch` | Show git branch → suggested Neon branch name |
| `yarn db:studio` | Open Drizzle Studio |

---

## Deployment

On Vercel, set the project **Root Directory** to `app` so builds use this Next.js package rather than the repo root.

## Deployment checklist

Before going live, confirm:

- [ ] Clerk application created and keys set in Vercel env vars
- [ ] Clerk redirect URLs include your production domain
- [ ] Clerk `user.deleted` webhook pointed at `/api/webhooks/clerk` with `CLERK_WEBHOOK_SIGNING_SECRET`
- [ ] Neon Postgres connected via Vercel Storage
- [ ] Preview branching enabled for isolated preview databases
- [ ] `DATABASE_URL` available in Production (via Neon integration)
- [ ] First deploy completes successfully (`yarn build` runs migrations)
- [ ] Sign-in, sign-up, dashboard, and an assessment flow tested on preview and production
- [ ] Staff can open `/dashboard/users`; super_admin can open `/dashboard/questions`
- [ ] Sanity project created and `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` set in Vercel
- [ ] CORS origins added for local and production
- [ ] Homepage, Settings, and Header menu published in Studio (`studio-productive-leadership/` or `/studio`)
- [ ] Vercel **Root Directory** set to `app`
- [ ] Revalidation webhook configured for the production domain

---

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Next.js Quickstart](https://clerk.com/docs/nextjs/getting-started/quickstart)
- [Neon + Vercel integration](https://neon.com/docs/guides/vercel-managed-integration)
- [Drizzle ORM docs](https://orm.drizzle.team/docs/overview)
- [Sanity + Next.js docs](https://www.sanity.io/docs/nextjs)
