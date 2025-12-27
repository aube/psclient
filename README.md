# psclient

# Сборка образа
docker build -t ps-client-app .

# Запуск контейнера
docker run -d -p 9000:9000 --name ps-client ps-client-app

# local
docker run -p 9000:9000 --network host VITE_API_BASE_URL=http://localhost:8080 --name ps-client ps-client-app

# remove 
docker stop ps-client && docker rm ps-client
docker stop ps-client && docker rm ps-client && docker rmi ps-client-app
