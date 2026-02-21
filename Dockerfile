FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install -g pnpm && pnpm install
RUN pnpm prune --prod

# Copy source code
COPY . .

# Создаем непривилегированного пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S client -u 1001
RUN chown -R client:nodejs /app
USER client

# Expose port (from server.js and docker-compose.yml we can see it runs on port 9000)
EXPOSE 9000

# Define health check endpoint
#HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#  CMD wget -q -O- http://localhost:9000/health | grep -q '"status":"ok"' || exit 1

# Start the application
CMD ["pnpm", "start"]