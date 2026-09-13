# ===================================================================
# Multi-stage Dockerfile for 24/7 Nari Georgia Jobs Bot
# ===================================================================

# 1. Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json tsconfig.json ./

# Install dependencies (including devDependencies for TypeScript build)
RUN npm ci

# Copy source code and assets
COPY src/ ./src/
COPY profile.jpeg *.pdf ./

# Build TypeScript
RUN npm run build

# 2. Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist

# Copy static assets (profile picture and resume PDFs)
COPY --from=builder /app/profile.jpeg ./
COPY --from=builder /app/*.pdf ./

# Create data directory for SQLite database
RUN mkdir -p /app/data && chown -R node:node /app

USER node

# Start the bot
CMD ["node", "dist/index.js"]
