# Multi-stage build for React app (optimized for small VPS)
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Increase Node.js heap size for memory-constrained environments
ENV NODE_OPTIONS="--max-old-space-size=1536"
ENV NPM_CONFIG_CACHE=/tmp/npm-cache

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps and memory optimization
RUN npm ci --legacy-peer-deps --no-audit --no-fund

# Copy source code
COPY . .

# Set environment variables for build
ARG REACT_APP_API_BASE_URL
ARG VITE_API_BASE_URL
ARG REACT_APP_LITE_MODE

# Build the app with memory optimization
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Remove default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Replace default nginx config to support client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the default Nginx port
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]

