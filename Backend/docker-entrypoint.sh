#!/bin/sh
set -e

is_local_url() {
  echo "$1" | grep -Eq 'localhost|127\.0\.0\.1'
}

if is_local_url "$DATABASE_URL" || [ -z "$DATABASE_URL" ]; then
  if [ -n "$PGHOST" ] && ! is_local_url "$PGHOST"; then
    echo "Rebuilding DATABASE_URL from Railway PG* variables (localhost URL is not reachable in the cloud)."
    DATABASE_URL="$(node -e '
      const user = process.env.PGUSER || "postgres";
      const pass = encodeURIComponent(process.env.PGPASSWORD || "");
      const host = process.env.PGHOST;
      const port = process.env.PGPORT || "5432";
      const db = process.env.PGDATABASE || "railway";
      process.stdout.write("postgresql://" + user + ":" + pass + "@" + host + ":" + port + "/" + db + "?schema=public");
    ')"
    export DATABASE_URL
  fi
fi

if [ -z "$DATABASE_URL" ] || is_local_url "$DATABASE_URL"; then
  echo ""
  echo "ERROR: DATABASE_URL points at localhost (or is missing)."
  echo "Railway cannot use your PC's Postgres at localhost:5433."
  echo ""
  echo "Fix: Backend service → Variables → New Variable → Add Reference"
  echo "     choose your Postgres plugin → DATABASE_URL"
  echo "Then redeploy. Do not paste the local .env DATABASE_URL."
  echo ""
  exit 1
fi

DB_HOST="$(echo "$DATABASE_URL" | sed -E 's#.*@([^:/]+).*#\1#')"
echo "Connecting to Postgres at ${DB_HOST}"

echo "Waiting for database..."
i=0
until npx prisma db push; do
  i=$((i + 1))
  if [ "$i" -ge 30 ]; then
    echo "Database did not become ready in time."
    exit 1
  fi
  echo "Retry $i/30..."
  sleep 2
done

echo "Seeding cinema catalog (users, Majnoon, hall, seats, showtimes)..."
export TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","moduleResolution":"node","esModuleInterop":true}'
if ! npx ts-node --transpile-only prisma/seed.ts; then
  echo "CLI seed failed; Nest bootstrap will seed cinema data on API start."
fi

echo "Starting API..."
if [ -f dist/main.js ]; then
  exec node dist/main.js
elif [ -f dist/src/main.js ]; then
  exec node dist/src/main.js
fi

echo "ERROR: Nest build output not found. dist contents:"
ls -la dist || true
ls -la dist/src || true
exit 1
