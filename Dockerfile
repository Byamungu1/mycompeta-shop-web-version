# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies needed to run 'npm run build')
RUN npm ci

# Copy source code
COPY . .

# Build-time env vars needed by Vite (import.meta.env.VITE_*).
# Render passes dashboard env vars through as build args automatically,
# but only for vars declared with ARG here — anything not declared is
# silently ignored during `docker build`.
ARG VITE_API_URL
ARG VITE_CART_STORAGE_KEY
ARG VITE_DIRECT_BUY_STORAGE_KEY
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GOOGLE_REDIRECT_URL

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CART_STORAGE_KEY=$VITE_CART_STORAGE_KEY
ENV VITE_DIRECT_BUY_STORAGE_KEY=$VITE_DIRECT_BUY_STORAGE_KEY
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_REDIRECT_URL=$VITE_GOOGLE_REDIRECT_URL

# Build the static application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port (matches nginx.conf's `listen 10000;`)
EXPOSE 10000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]