# Используем официальный образ Node.js с pnpm
FROM node:22-alpine

# Устанавливаем pnpm глобально
RUN npm install -g pnpm

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы конфигурации pnpm и package.json
COPY package.json pnpm-lock.yaml* ./

# Устанавливаем зависимости через pnpm
RUN pnpm install

# Копируем исходный код
COPY . .

# Собираем клиентскую и серверную части
RUN pnpm run build:client && pnpm run build:server

# Удаляем dev зависимости для уменьшения размера образа
RUN pnpm prune --prod

# Создаем непривилегированного пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S vuejs -u 1001
RUN chown -R vuejs:nodejs /app
USER vuejs

# Открываем порт
EXPOSE 9000

# Запускаем production сервер
CMD ["npm", "run", "preview"]
