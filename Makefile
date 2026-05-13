# Подключаем .env.local из текущей папки
-include .env.local

# Проверка переменной SERVICE_NAME
# Если она пустая, make выдаст ошибку и остановится
check-env:
ifndef SERVICE_NAME
	$(error SERVICE_NAME is not set in .env.local)
endif

# Команда dev
dev: check-env
	docker compose -f ../docker-compose.yml -f ../docker-compose.override.yml \
		down $(SERVICE_NAME) -v && \
	docker compose -f ../docker-compose.yml -f ../docker-compose.override.yml \
		up $(SERVICE_NAME) --build
