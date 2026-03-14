# ChatMesh

Realtime chat application built on a microservice architecture.

## Architecture

| Service | Port | Description |
|---------|------|-------------|
| **auth** | 8001 (REST), 50051 (gRPC) | Authentication, JWT, user management |
| **chat** | 8002 | Rooms, messages, history |
| **websocket-gateway** | 8003 | WebSocket connections, realtime events |
| **notifications** | 8004 | Push notifications for offline users |
| **frontend** | 3000 | Next.js web application |

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, gRPC, Redis Pub/Sub
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **Infrastructure**: PostgreSQL, Redis, Docker

## Quick Start

```bash
docker-compose up --build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
