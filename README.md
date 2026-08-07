# AI-Driven Collaborative Learning Platform

A full-stack adaptive learning platform (Stage 1 MVP). Future stages will add a Python adaptive-learning engine, a RAG-based AI tutor, and real-time study rooms.

## Repository Structure

```
Learning Platform/
├── docker-compose.yml   ← PostgreSQL database (local dev only)
├── backend/             ← Spring Boot REST API (Java 17, Maven)
└── frontend/            ← React + Vite SPA (added in later steps)
```

## Quick Start

### 1. Start the Database

```bash
docker-compose up -d
```

### 2. Start the Backend

```bash
cd backend
cp .env.example .env
# Edit .env if needed (defaults work with docker-compose)
mvn spring-boot:run
```

### 3. Start the Frontend *(added later)*

```bash
cd frontend
npm install
npm run dev
```

## Services

| Service  | Port | Description                |
|----------|------|----------------------------|
| Backend  | 8080 | Spring Boot REST API       |
| Postgres | 5432 | PostgreSQL 15 (via Docker) |
| Frontend | 5173 | React + Vite dev server    |
