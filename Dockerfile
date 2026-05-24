# Шаг 1: Общая сборка всех pom.xml для кэширования зависимостей
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Копируем родительский POM и структуры ВСЕХ модулей
COPY pom.xml .
COPY user-service/pom.xml ./user-service/
COPY gateway-service/pom.xml ./gateway-service/

# Копируем исходный код всех сервисов
COPY user-service/src ./user-service/src
COPY gateway-service/src ./gateway-service/src

# Передаем имя сервиса как аргумент (по умолчанию user-service)
ARG SERVICE_NAME=user-service

# Собираем конкретный микросервис
RUN mvn clean package -pl ${SERVICE_NAME} -am -DskipTests

# Шаг 2: Легковесный запуск
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Снова используем аргумент для копирования нужного jar-файла
ARG SERVICE_NAME=user-service
COPY --from=build /app/${SERVICE_NAME}/target/${SERVICE_NAME}-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]