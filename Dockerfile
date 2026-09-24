# =========================================================
# Stage 1: Build Frontend and Server Bundle
# =========================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package.json package-lock.json* bun.lock* ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy application source code
COPY . .

# Build Vite client assets and server bundle
RUN npm run build

# =========================================================
# Stage 2: Production Container
# =========================================================
FROM node:22-alpine AS runner

WORKDIR /app

# Install curl for Docker healthchecks
RUN apk --no-cache add curl

# Set environment defaults
ENV NODE_ENV=production \
    PORT=3000 \
    DATA_FILE_PATH=/app/data/data.json

# Copy package manifests and install only production dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --ignore-scripts

# Copy compiled frontend and bundled server from builder stage
COPY --from=builder /app/dist ./dist

# Create persistent storage folder and grant permissions to node user
RUN mkdir -p /app/data && chown -R node:node /app

# Run as non-root user for security
USER node

# Expose web application port
EXPOSE 3000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the full-stack production server
CMD ["node", "dist/server.cjs"]
