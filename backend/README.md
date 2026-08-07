# Backend Service — Learning Platform

Spring Boot 3.2 REST API providing authentication, course management, and quiz functionality.

## Tech Stack

| Concern       | Technology                          |
|---------------|-------------------------------------|
| Framework     | Spring Boot 3.2 / Java 17           |
| Security      | Spring Security + JWT (jjwt 0.12)  |
| Persistence   | Spring Data JPA + PostgreSQL 15     |
| Build         | Maven                               |
| Testing       | JUnit 5 + Spring Boot Test          |

## Project Structure

```
src/main/java/com/learningplatform/
├── LearningPlatformApplication.java   ← Entry point (wiring only)
├── shared/
│   ├── config/
│   │   └── SecurityConfig.java        ← Spring Security filter chain
│   ├── controller/
│   │   └── HealthController.java      ← GET /api/health
│   ├── dto/
│   │   └── ErrorResponse.java         ← Standard error envelope
│   └── exception/
│       ├── GlobalExceptionHandler.java
│       ├── ResourceNotFoundException.java
│       └── ForbiddenException.java
├── auth/                              ← (added in Step 2)
├── course/                            ← (added in Step 3)
└── quiz/                              ← (added in Step 4)
```

## Running Locally

### Prerequisites
- Java 17
- Maven 3.8+
- Docker (for PostgreSQL)

### 1. Start the database

From the repo root:
```bash
docker-compose up -d
```

Wait for the health check to pass:
```bash
docker-compose ps   # Status should show "healthy"
```

### 2. Configure environment

```bash
cp .env.example .env
# Defaults work out of the box with docker-compose — no edits needed for local dev.
```

### 3. Run the backend

```bash
mvn spring-boot:run
```

The server starts on **http://localhost:8080**.

### 4. Verify

```bash
curl http://localhost:8080/api/health
# Expected: {"status":"ok","service":"learning-platform-backend"}
```

## API Endpoints (Stage 1)

| Method | Path                              | Auth     | Description             |
|--------|-----------------------------------|----------|-------------------------|
| GET    | `/api/health`                     | None     | Health check            |
| POST   | `/api/auth/register`              | None     | Register new user       |
| POST   | `/api/auth/login`                 | None     | Login, receive JWT      |
| GET    | `/api/auth/me`                    | JWT      | Get current user        |
| GET    | `/api/courses`                    | JWT      | List all courses        |
| GET    | `/api/courses/{id}`               | JWT      | Course detail           |
| POST   | `/api/courses`                    | INSTRUCTOR | Create course         |
| GET    | `/api/courses/{id}/quiz`          | JWT      | Get quiz for course     |
| POST   | `/api/courses/{id}/quiz/submit`   | STUDENT  | Submit quiz answers     |

## Running Tests

```bash
mvn test
```

> **Note**: Tests require a running PostgreSQL instance (or override `DB_URL` to an in-memory datasource).
