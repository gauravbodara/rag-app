# 1. Base image for dependencies
FROM node:22-alpine AS deps
WORKDIR /app

# Install only the dependencies
COPY package.json package-lock.json* ./
RUN npm install

# 2. Copy the full source code and build the app
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry and build the Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3. Final lightweight image to run the production app
FROM node:22-alpine AS runner
WORKDIR /app

# Only include what’s needed
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start the Next.js server
CMD ["npm", "run", "start"]
