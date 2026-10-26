# Etapa 1: instala dependencias y empaqueta el código TS en un único JS.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
# qrcode y nodemailer son CommonJS y hacen require() de módulos de Node: el banner
# le da al bundle ESM un require real para que no falle con "Dynamic require".
RUN npx esbuild src/main.ts --bundle --platform=node --format=esm --outfile=dist/main.js \
  "--banner:js=import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);"

# Etapa 2: solo Node y el bundle, sin node_modules.
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0
COPY --from=build /app/dist ./dist
RUN mkdir -p bd/data && chown -R node:node bd
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
