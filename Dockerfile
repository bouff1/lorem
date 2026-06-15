# syntax=docker/dockerfile:1

# ---- 1. Dépendances ---------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# npm ci si un lockfile existe (recommandé), sinon npm install en repli.
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# ---- 2. Build ---------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- 3. Image finale (légère, build "standalone") ---------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Instantané Riot écrit dans /data (à monter en volume pour le rendre persistant).
ENV RIOT_SNAPSHOT_PATH=/data/riot-snapshot.json

# Utilisateur non-root
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Dossier persistant pour l'instantané, accessible par l'utilisateur nextjs.
RUN mkdir -p /data && chown nextjs:nodejs /data
VOLUME ["/data"]

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
