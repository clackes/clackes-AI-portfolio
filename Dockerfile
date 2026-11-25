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

# backend code + the assets built in stage 1 (strings.json: the site's default
# texts, read by the admin API; server/data is a volume, never baked in)
COPY server ./server
COPY src/strings.json ./src/strings.json
ARG GIT_COMMIT=""
ARG BUILT_AT=""
ENV GIT_COMMIT=$GIT_COMMIT BUILT_AT=$BUILT_AT
COPY --from=build /app/dist ./dist

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8787/api/health >/dev/null || exit 1

CMD ["node", "server/index.js"]
