# --- Шаг 1: Сборка ---
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# 1. Сначала копируем ТОЛЬКО pom.xml файлы. Это критически важно для кэширования!
COPY pom.xml .
COPY user-service/pom.xml ./user-service/
COPY gateway-service/pom.xml ./gateway-service/
COPY listing-service/pom.xml ./listing-service/

# 2. Заставляем Мавен скачать все зависимости из интернета заранее.
# Этот шаг выполнится ОДИН раз и закэшируется. При изменении кода он НЕ будет перезапускаться.
RUN mvn dependency:go-offline -B

# 3. Только ТЕПЕРЬ копируем исходный код (src)
COPY user-service/src ./user-service/src
COPY gateway-service/src ./gateway-service/src
COPY listing-service/src ./listing-service/src

# 4. Принимаем аргумент имени сервиса и собираем его (зависимости уже в кэше, сборка займет пару секунд)
ARG SERVICE_NAME
RUN mvn clean package -pl ${SERVICE_NAME} -am -DskipTests

# --- Шаг 2: Запуск ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

ARG SERVICE_NAME
COPY --from=build /app/${SERVICE_NAME}/target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]