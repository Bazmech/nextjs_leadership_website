---
name: sanity
description: Use whenever Sanity is mentioned or relevant — Studio, schemas, GROQ, Portable Text, webhooks, datasets, or the /studio route. Load for CMS content modeling and fetching questions.
---

Sanity is the marketing CMS for this site. Assessments and user data stay in Neon.

1. Content models live in `app/src/sanity/schemaTypes/` (mirrored in `studio-productive-leadership/schemaTypes/`). Studio configs are `app/sanity.config.js` and `studio-productive-leadership/sanity.config.js`.
2. Fetch with `sanityFetch()` from `app/src/sanity/lib/client.js` and GROQ in `app/src/sanity/lib/queries.js`. Tag cache with `sanity`.
3. Render page builder slices from `app/src/slices/` via `SliceZone`. Render Portable Text only through `RichText`.
4. Standalone Studio is `studio-productive-leadership/` (`npm run dev`, port 3333). Embedded Studio remains at `/studio`. Revalidation is `POST /api/revalidate` with `SANITY_WEBHOOK_SECRET`.
5. Do not use Prismic packages, Slice Machine, or `npx prismic` in this branch.
