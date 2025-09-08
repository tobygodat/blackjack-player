## Multi-stage build for Spring Boot app located under blackjackproject/

# Stage 1: Build with Maven (Java 17)
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy only pom first to leverage layer caching for dependencies
COPY blackjackproject/pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline

# Copy sources and build
COPY blackjackproject/src ./src
RUN mvn -q -DskipTests package

# Stage 2: Runtime with a slim JRE 17
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the fat jar built by Spring Boot
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]