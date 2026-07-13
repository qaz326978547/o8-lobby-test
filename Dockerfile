FROM node:24-alpine AS builder

WORKDIR /app

ARG VITE_UGS_API_BASE
ARG VITE_UGS_FRONTEND_ORIGIN
ENV VITE_UGS_API_BASE=$VITE_UGS_API_BASE
ENV VITE_UGS_FRONTEND_ORIGIN=$VITE_UGS_FRONTEND_ORIGIN

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM caddy:2-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/dist /usr/share/caddy

EXPOSE 80

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]