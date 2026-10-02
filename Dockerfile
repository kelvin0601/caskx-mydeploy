# syntax=docker/dockerfile:1.4

###############################################################################
# Base Stage
###############################################################################
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

###############################################################################
# 1. Dependencies Stage
###############################################################################
FROM base AS deps
RUN apk add --no-cache python3 make g++ git

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps  

###############################################################################
# 2. Builder Stage
###############################################################################
FROM base AS builder
RUN apk add --no-cache python3 make g++ git

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_API_URL
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG NEXT_PUBLIC_STRIPE_PUBLIC_KEY
ARG STRIPE_CONNECT_ACCOUNT_ID

# Environment variables
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXT_PUBLIC_STRIPE_PUBLIC_KEY=$NEXT_PUBLIC_STRIPE_PUBLIC_KEY
ENV STRIPE_CONNECT_ACCOUNT_ID=$STRIPE_CONNECT_ACCOUNT_ID

RUN npm run build

###############################################################################
# 3. Production Stage (Rất nhẹ)
###############################################################################
FROM base AS production

ENV NODE_ENV=production

# Tạo user non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output (tối ưu nhất)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy package.json để start
COPY --from=builder /app/package.json ./

USER nextjs

EXPOSE 3000

# Standalone mode sẽ có file server.js
CMD ["node", "server.js"]