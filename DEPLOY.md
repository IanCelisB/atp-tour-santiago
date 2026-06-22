# Deploy to Render

One-click deployment using Render Blueprints.

## Prerequisites

- GitHub repo with `render.yaml` at root
- Google Cloud Console project with OAuth 2.0 credentials

## Steps

1. Push your code to GitHub.
2. Go to <https://dashboard.render.com/> and click **New +** → **Blueprint**.
3. Connect your GitHub account and select the `atp-tour-santiago` repo.
4. Render detects `render.yaml` automatically. Click **Apply**.
5. In the service's **Environment** tab, set:
   - `GOOGLE_CLIENT_ID` (from Google Cloud Console)
   - `GOOGLE_CLIENT_SECRET` (from Google Cloud Console)
6. In **Google Cloud Console → Credentials**, add your Render URL to:
   - Authorized JavaScript origins (e.g., `https://atp-tour-santiago.onrender.com`)
   - Authorized redirect URIs (add `/api/auth/google/callback`)

The first deploy runs migrations and seeds admin users from
`lib/auth/admin-emails.ts`.

## How it works

- **Persistent disk**: SQLite database lives at `/var/data/prisma/prod.db` on a
  1 GB persistent disk. Data survives deploys and restarts.
- **Startup script**: `scripts/start.js` ensures the DB directory exists, runs
  pending migrations, seeds admin users, then starts Next.js.
- **Build**: `render.yaml` runs `pnpm install`, `prisma generate`,
  `prisma migrate deploy`, and `next build` during the build phase.

## Free tier note

The service sleeps after 15 minutes of inactivity. The first request after
sleep takes ~30 seconds to respond.

## Environment variables

| Variable | Source | Description |
|----------|--------|-------------|
| `DATABASE_URL` | `render.yaml` | `file:/var/data/prisma/prod.db` |
| `SESSION_SECRET` | Auto-generated | iron-session encryption key |
| `GOOGLE_CLIENT_ID` | Manual | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Manual | Google OAuth client secret |
| `NODE_ENV` | `render.yaml` | `production` |
