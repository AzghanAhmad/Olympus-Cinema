# Deploy Crystal Entertainment on Railway

The repo is a monorepo: **Backend** (NestJS) + **Frontend** (Next.js). Railway should run them as **two services**, plus **PostgreSQL** and **Redis**. Each app has a Dockerfile that builds, migrates, seeds, and starts automatically.

## 1. Push the project to GitHub

If it is not already on GitHub:

```bash
git add .
git commit -m "Add Railway Docker deployment"
git push
```

## 2. Create a Railway project

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. **New Project** → **Empty project** (or deploy from the GitHub repo).
3. Open the project.

## 3. Add Postgres and Redis

In the project canvas:

1. **+ Create** → **Database** → **PostgreSQL**
2. **+ Create** → **Database** → **Redis**

Wait until both are running.

## 4. Deploy the API (Backend)

1. **+ Create** → **GitHub Repo** → select this repository.
2. Name the service `backend` (optional but matches the variable names below).
3. **Settings**:
   - **Root Directory:** `Backend`
   - **Builder:** Dockerfile (auto-detected from `Backend/Dockerfile`)
4. **Variables** → add:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` |
| `JWT_ACCESS_SECRET` | a long random string (32+ characters) |
| `JWT_REFRESH_SECRET` | a different long random string |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `SEAT_HOLD_MINUTES` | `10` |
| `FRONTEND_URL` | `https://olympus-cinema-production.up.railway.app` |
| `EMAIL_FROM` | `Cinema <noreply@cinema.local>` |
| `THROTTLE_TTL` | `60` |
| `THROTTLE_LIMIT` | `100` |

If Railway named the database services differently, pick them from the variable reference menu instead of typing `Postgres` / `Redis`.

**Do not paste `DATABASE_URL` from your local `.env`.** That value is `localhost:5433` and only works on your PC. Railway must use a **reference** to the Postgres plugin.

5. **Settings → Networking → Generate Domain** for the backend. Copy that URL (example: `https://backend-production-xxxx.up.railway.app`).
6. Deploy. The container runs `prisma db push`, then starts the API. On boot the API seeds **the same cinema data as `Backend/prisma/seed.ts`**: admin accounts, Majnoon, hall/seats, upcoming showtimes, news, and settings. Health check: `/health`.

Seed logins after a successful deploy:

- Admin: `admin@cinema.local` / `Password123!`
- User: `user@cinema.local` / `Password123!`

## 5. Deploy the website (Frontend)

1. **+ Create** → **GitHub Repo** → same repository.
2. Name the service `frontend`.
3. **Settings**:
   - **Root Directory:** `Frontend`
   - **Builder:** Dockerfile
4. **Variables** → add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://${{backend.RAILWAY_PUBLIC_DOMAIN}}` |

This value is **baked in at Docker build time**. Set it before the first frontend deploy. If the backend domain changes, **Redeploy** the frontend.

5. **Settings → Networking → Generate Domain**.
6. Go back to **backend → Variables** and confirm `FRONTEND_URL` uses the frontend domain, then redeploy backend if needed (CORS).

## 6. Service graph

```
GitHub repo
  ├── backend  ── DATABASE_URL ──► Postgres
  │            └── REDIS_URL    ──► Redis
  └── frontend ── NEXT_PUBLIC_API_URL ──► backend public URL
```

## 7. After deploy

- Site: `https://<frontend>.up.railway.app`
- API docs: `https://<backend>.up.railway.app/api/docs`
- Health: `https://<backend>.up.railway.app/health`

Sign in as admin and confirm movies, screenings, and bookings load from the API.

## Local Docker (same images)

From the repo root, with Docker Desktop running:

```bash
docker compose up --build
```

- App: http://localhost:3000
- API: http://localhost:4000
- Postgres: localhost:5433 (password `postgres`)

## Common issues

- **`P1001: Can't reach database server at localhost:5433`**  
  The backend is still using the local `.env` URL. In Railway → **backend** → **Variables**, delete that `DATABASE_URL` if you typed it by hand. Click **New Variable** → **Add Reference** → select the **Postgres** service → **DATABASE_URL**. Redeploy. The URL should look like `postgres.railway.internal`, not `localhost`.

- **Frontend calls localhost:4000 in production**  
  `NEXT_PUBLIC_API_URL` was missing at image build. Set it and **Redeploy** frontend.

- **CORS blocked**  
  Backend `FRONTEND_URL` must be the exact frontend https URL (no trailing slash).

- **Database connection failed**  
  Use the **private** `${{Postgres.DATABASE_URL}}` on the backend service, not the public proxy URL.

- **Redis errors**  
  Set `REDIS_URL` from the Redis plugin. Do not point `REDIS_HOST` at localhost.

- **Empty admin data**  
  Seed runs on backend start. Check backend deploy logs for `Seed complete`.
