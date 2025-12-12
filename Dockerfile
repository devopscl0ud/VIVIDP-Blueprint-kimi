# Multi-stage build for frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production frontend image
FROM node:20-alpine AS frontend
WORKDIR /app
COPY --from=frontend-builder /app/dist ./dist
EXPOSE 3000
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]

# Backend build stage
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY server ./server
RUN npm run backend:build

# Production backend image
FROM node:20-alpine AS backend
WORKDIR /app
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server/index.js"]
