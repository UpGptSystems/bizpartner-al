FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl openssl-dev

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nexus

COPY --from=builder --chown=nexus:nodejs /app/dist ./dist
COPY --from=builder --chown=nexus:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nexus:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nexus:nodejs /app/package.json ./
COPY --chown=nexus:nodejs entrypoint.sh ./entrypoint.sh

RUN mkdir -p logs && chown nexus:nodejs logs
RUN chmod +x entrypoint.sh
USER nexus

EXPOSE 5000
CMD ["./entrypoint.sh"]
