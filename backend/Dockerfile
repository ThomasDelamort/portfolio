# ---- Stage 1: Build ----
# Installs ALL dependencies (including devDependencies like typescript)
# and compiles TypeScript -> JavaScript into /dist
FROM node:22-alpine AS builder

WORKDIR /app

# Copy only package files first so Docker can cache this layer —
# npm install only re-runs when package.json/package-lock.json actually change
COPY package.json package-lock.json ./
RUN npm ci

# Now copy the rest of the source and compile
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Stage 2: Production ----
# A fresh, slim image with ONLY production dependencies and the
# compiled JS output. No TypeScript, no dev tools, no source files.
FROM node:22-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

# Install production deps only (no devDependencies)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the compiled output from the builder stage
COPY --from=builder /app/dist ./dist

# Render (and most platforms) inject PORT at runtime; this is just a default/doc value
EXPOSE 5000

CMD ["node", "dist/server.js"]
