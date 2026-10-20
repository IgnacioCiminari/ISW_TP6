# Etapa 1: build de Vite. El front importa reglas y tipos de ../backend/src,
# que llegan por el contexto adicional "backend" definido en docker-compose.
FROM node:24-alpine AS build
WORKDIR /app/frontend
COPY package.json package-lock.json ./
RUN npm ci
COPY --from=backend src /app/backend/src
COPY . .
RUN npm run build

# Etapa 2: nginx sirve los estáticos y hace de proxy de /api al backend.
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
