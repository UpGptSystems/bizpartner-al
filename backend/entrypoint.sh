#!/bin/sh
set -e

echo "Running Prisma migrations..."
./node_modules/.bin/prisma migrate deploy

echo "Running database seed..."
./node_modules/.bin/tsx prisma/seed.ts || echo "Seed already done or failed, continuing..."

echo "Starting server..."
exec node dist/app.js
