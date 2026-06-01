# --- Шаг 1: Сборка ---
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# 1. Копируем pom'ы ПЕРВЫМИ (перед любыми Maven команд)
COPY pom.xml .
COPY user-service/pom.xml ./user-service/
COPY gateway-service/pom.xml ./gateway-service/
COPY listing-service/pom.xml ./listing-service/
COPY image-service/pom.xml ./image-service/
COPY chat-service/pom.xml ./chat-service/
COPY notification-service/pom.xml ./notification-service/

# 2. ТЕПЕРЬ скачиваем зависимости (pom.xml уже на месте!)
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -B

# 3. Копируем исходный код
COPY user-service/src ./user-service/src
COPY gateway-service/src ./gateway-service/src
COPY listing-service/src ./listing-service/src
COPY image-service/src ./image-service/src
COPY chat-service/src ./chat-service/src
COPY notification-service/src ./notification-service/src

# 4. Собираем с параллельной компиляцией и кэшем
ARG SERVICE_NAME
RUN --mount=type=cache,target=/root/.m2 \
    mvn clean package -pl ${SERVICE_NAME} -am -DskipTests -T 1C

# --- Шаг 2: Запуск ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

ARG SERVICE_NAME
COPY --from=build /app/${SERVICE_NAME}/target/*.jar app.jar

EXPOSE 8080 8081 8082 8084 8085 8086

ENTRYPOINT ["java", "-jar", "app.jar"]