# Шаг 1: Общая сборка всех pom.xml для кэширования зависимостей
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Копируем родительский POM и структуры ВСЕХ модулей
COPY pom.xml .
COPY user-service/pom.xml ./user-service/
COPY gateway-service/pom.xml ./gateway-service/
COPY listing-service/pom.xml ./listing-service/

# ВАЖНО: Копируем папки src целиком (вместе с java и resources внутри них)
COPY user-service/src ./user-service/src
COPY gateway-service/src ./gateway-service/src
COPY listing-service/src ./listing-service/src

# Передаем имя сервиса как аргумент
ARG SERVICE_NAME=user-service

# Собираем конкретный микросервис
RUN mvn clean package -pl ${SERVICE_NAME} -am -DskipTests

# Шаг 2: Легковесный запуск
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

ARG SERVICE_NAME=user-service
COPY --from=build /app/${SERVICE_NAME}/target/${SERVICE_NAME}-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]