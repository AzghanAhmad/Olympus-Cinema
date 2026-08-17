#!/bin/sh
set -e

echo "Waiting for database..."
npx prisma db push
echo "Seeding database (safe to re-run)..."
npx prisma db seed || echo "Seed skipped"

echo "Starting API..."
exec node dist/main
