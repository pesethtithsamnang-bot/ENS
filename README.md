# I-Information Web

The public-facing site. Reads from the same Supabase project as
`i-information-admin`, using only the public anon key - no login required.

## Setup

```bash
npm install
cp .env.example .env
# fill in the same VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as the admin app
npm run dev
```

## What it does

- Home: latest published posts, categories, sidebar ads, subscribe card
- Article: full post with your content blocks (text/images in order), source citation, related posts
- Category: posts filtered by category
- Search: simple title/body match against published posts
- Terms: pulls the terms and conditions text set in the admin's Site Settings

Every read here respects Row Level Security - a draft post, a hidden
category, or a paused ad is invisible to this app at the database level,
not filtered by app code. The only writes this app makes are: a new row in
`subscribers` when someone subscribes, and a row in `page_visits` per
pageview for the admin's Analytics tab.

## Deploying

Same as the admin app: Cloudflare Pages or Netlify, build command
`npm run build`, output directory `dist`, and set the two env vars in the
host's dashboard rather than committing `.env`.
