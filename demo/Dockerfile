FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
COPY src/ src/
RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
COPY --from=build --chown=spring:spring /workspace/target/*.jar /app/app.jar
USER spring:spring
ENV PORT=8081
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=55.0 -XX:InitialRAMPercentage=20.0 -XX:+UseSerialGC -XX:MaxMetaspaceSize=112m -XX:ReservedCodeCacheSize=32m -XX:MaxDirectMemorySize=32m -Xss512k"
EXPOSE 8081
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 CMD wget -q -O /dev/null "http://127.0.0.1:${PORT:-8081}/actuator/health" || exit 1
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
