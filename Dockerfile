# Production (Dockerfile)
# ------------------------
# Stage 1: Base image
FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && apk add --no-cache curl
COPY package.json pnpm-lock.yaml* .npmrc ./

# Stage 2: Dependency installation
FROM base AS deps
RUN pnpm install --frozen-lockfile --prod

# Stage 3: Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# Final production image
FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json .
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
