# Crystal Entertainment — Cinema Booking API

Production-ready NestJS backend for the cinema booking platform.

## Stack

- NestJS + TypeScript
- PostgreSQL + Prisma ORM
- Redis (seat holds)
- Socket.IO (real-time seat updates)
- JWT auth (access + refresh tokens)
- Swagger at `/api/docs`

## Setup

Start Postgres and Redis (Docker Desktop must be running). Postgres is mapped to **5433** because Windows PostgreSQL often already occupies 5432.

```bash
cd Backend
docker compose up -d
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

## Docker (local, all-in-one)

From the **repo root** (Docker Desktop running):

```bash
docker compose up --build
```

App: http://localhost:3000  
API: http://localhost:4000

## Railway

See [DEPLOY.md](../DEPLOY.md) in the repo root.

## Seed accounts

| Role  | Email               | Password      |
|-------|---------------------|---------------|
| Admin | admin@cinema.local  | Password123!  |
| Staff | staff@cinema.local  | Password123!  |
| User  | user@cinema.local   | Password123!  |

## Booking flow

1. `GET /screenings/:id/seats` — seat availability
2. `POST /screenings/:screeningId/holds` — atomic Redis hold
3. `POST /bookings` — transactional confirmation
4. WebSocket `/cinema` — real-time updates

## Double-booking protection

- Redis atomic `SET NX` for holds
- PostgreSQL `@@unique([screeningId, seatId])` on `ScreeningSeatReservation`
- Prisma transactions with P2002 → 409 Conflict
