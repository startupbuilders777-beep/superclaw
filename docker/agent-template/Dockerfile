# Per-user Agent Container Template
# This Dockerfile serves as the base template for dynamically spawned agent containers
# Each user gets their own isolated container with pre-configured skill system

FROM node:22-alpine AS base

# Install dependencies for node-pty (required for agent shell access)
RUN apk add --no-cache \
    python3 \
    make \
    g++

# ============================================
# BUILDER STAGE
# ============================================
FROM base AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install pnpm and dependencies
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN pnpm build

# ============================================
# RUNNER STAGE
# ============================================
FROM base AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 agent

# Copy built artifacts
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy skill templates
COPY --from=builder /app/skills ./skills

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose agent API port
EXPOSE 3000

# Switch to non-root user
USER agent

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the agent server
CMD ["node", "server.js"]
