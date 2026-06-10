# Stage 1 — build the jar
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn -q -DskipTests package

# Stage 2 — slim runtime
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Render/Railway inject PORT; the app reads it (server.port=${PORT:...})
EXPOSE 1004
ENTRYPOINT ["java","-jar","app.jar"]
