# ChatMesh

Realtime chat application built on a microservice architecture.

## Architecture

| Service | Port | Description |
|---------|------|-------------|
| **auth** | 8001 | Authentication, JWT, user management |
| **chat** | 8002 | Rooms, messages, history |
| **websocket-gateway** | 8003 | WebSocket connections, realtime events |
| **notifications** | 8004 | Notifications for new messages |
| **frontend** | 3000 | Next.js web application |
| **RabbitMQ Management** | 15672 | Broker dashboard (chatmesh / chatmesh_secret) |

## Tech Stack

- **Backend**: FastAPI, FastStream, SQLAlchemy, RabbitMQ (RPC + Pub/Sub)
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, React Query
- **Infrastructure**: PostgreSQL, RabbitMQ, Docker

## Inter-Service Communication

- **RPC** (via RabbitMQ): Synchronous calls — auth token verification, room member lookups
- **Pub/Sub** (via RabbitMQ topic exchange): Async events — new messages, typing indicators, presence
- **WebSocket**: Gateway ↔ Frontend for realtime delivery

## Quick Start

```bash
cp .env.example .env
docker-compose up --build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- User registration and authentication (JWT)
- Create and join chat rooms
- Realtime messaging via WebSocket
- Typing indicators
- Online presence tracking
- Notifications for new messages
- Dark theme UI
