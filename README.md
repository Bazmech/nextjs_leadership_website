# Productive Leadership

Monorepo with the Next.js site and a standalone Sanity Studio.

| Folder | What it is |
|--------|------------|
| `app/` | Next.js 16 site (Clerk, Neon assessments, Sanity-powered pages) |
| `studio-productive-leadership/` | Standalone Sanity Studio for project `vrub9uq4` |

## App

```bash
cd app
yarn install
yarn dev
```

See `app/README.md` for setup and deployment notes. Copy `app/.env.example` to `app/.env.local` for local keys. On Vercel, set the project **Root Directory** to `app`.

## Studio

```bash
cd studio-productive-leadership
npm install
npx sanity dev
```

Studio runs on http://localhost:3333 and uses dataset `production`.
