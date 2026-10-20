# Etapa 1: instala dependencias y empaqueta el código TS en un único JS.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npx esbuild src/main.ts --bundle --platform=node --format=esm --outfile=dist/main.js

# Etapa 2: solo Node y el bundle, sin node_modules.
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0
COPY --from=build /app/dist ./dist
RUN mkdir -p bd/data && chown -R node:node bd
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
