# --- Этап 1: База ---
FROM node:22-alpine AS base
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./

# --- Этап 2: Разработка (dev) ---
FROM base AS dev
RUN pnpm install
COPY . .
# 24677 - HMR/LiveReload, 9229 - Node Debugger
EXPOSE 8070 24677 9229
CMD ["pnpm", "run", "dev"]

# --- Этап 3: Продакшн (release) ---
FROM node:22-alpine AS release
RUN npm install -g pnpm
WORKDIR /app

# Сертификаты для внешних запросов и системный пользователь
RUN apk add --no-cache ca-certificates \
    && addgroup -g 1001 -S nodejs \
    && adduser -S client -u 1001 -G nodejs

COPY --from=dev /app/package.json ./package.json
# Устанавливаем только чистые продакшн-зависимости
RUN pnpm install --prod

COPY . .
RUN chown -R client:nodejs /app

USER client
EXPOSE 8070
CMD ["pnpm", "start"]