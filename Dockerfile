# syntax=docker/dockerfile:1.7

# ---------- Stage 1: build the frontend ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ---------- Stage 2: runtime (Node serves the API + the built SPA) ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8787

# production-only dependencies (express, cors, gemini sdk, dotenv)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-audit --no-fund

# backend code + the assets built in stage 1
COPY server ./server
COPY --from=build /app/dist ./dist

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8787/api/health >/dev/null || exit 1

CMD ["node", "server/index.js"]
