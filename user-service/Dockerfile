# Шаг 1: Сборка артефакта
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
COPY user-service/pom.xml ./user-service/
COPY user-service/src ./user-service/src

RUN mvn clean package -pl user-service -am -DskipTests

# Шаг 2: Запуск
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/user-service/target/user-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]