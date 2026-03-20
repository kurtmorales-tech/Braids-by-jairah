# Braids By Jaira - Fast Ship Setup

This app is configured for:
- Frontend: Vite + React on Cloudflare Pages
- API: Cloudflare Worker (`/api/consult`) for secure Gemini access
- Data/Auth: Supabase

## Local Development

Prerequisites:
- Node.js 22+
- npm

1) Install dependencies:

```bash
npm ci
```

2) Create local env from template:

```bash
cp .env.example .env.local
```

3) Fill `.env.local`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL=http://localhost:8787`

4) In one terminal, run the Worker:

```bash
npm run worker:dev
```

5) In a second terminal, run the frontend:

```bash
npm run dev
```

## Cloudflare Deployment (Production)

### 1) Deploy Worker API

Set the secret once:

```bash
npx wrangler secret put GEMINI_API_KEY
```

Deploy:

```bash
npm run worker:deploy
```

Save the deployed Worker URL, for example:
`https://bb-jairah-consult-api.<subdomain>.workers.dev`

### 2) Deploy Pages Frontend

In Cloudflare Pages project settings:
- Framework preset: `Vite`
- Build command: `npm ci && npm run build`
- Build output directory: `dist`

Set frontend environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL` = your Worker URL

Then deploy.

## Supabase Launch Checklist

- Auth redirect URLs include your Pages domain(s)
- Public `anon` access is restricted to required operations only
- `bookings` table insert policy allows intended users/flow
- `services` and `bookings` read/write policies match admin/public behavior
- Email auth templates and sender are production-ready

## Docker (Optional Local Parity)

Build:

```bash
docker build -t bb-jairah-site .
```

Run:

```bash
docker run --rm -p 8080:80 bb-jairah-site
```

Then open `http://localhost:8080`.

## CI

GitHub Actions workflow runs on push/PR:
- `npm ci`
- `npm run build`

## Smoke Test Checklist (Pre-Go-Live)

1) Public navigation loads and tab switching works
2) Booking flow inserts a booking row in Supabase
3) Admin login/logout works and dashboard loads data
4) Consult endpoint (`/api/consult`) returns response through frontend
5) No `GEMINI_API_KEY` appears in frontend bundle or browser dev tools network payloads

## Rollback

If consult API has issues:
- Redeploy/rollback Worker to previous version
- Keep frontend unchanged if static pages are healthy
- If needed, temporarily hide or disable Consult tab until Worker is stable
