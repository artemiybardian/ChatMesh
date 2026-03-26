# ChatMesh

Realtime chat application built on a microservice architecture.

## Architecture

| Service | Description |
|---------|-------------|
| **nginx** | Reverse proxy — single entry point on port 80 |
| **auth** | Authentication, JWT + refresh tokens, httpOnly cookies |
| **chat** | Rooms, messages, history |
| **websocket-gateway** | WebSocket connections, realtime events |
| **notifications** | Notifications for new messages |
| **frontend** | Next.js web application |
| **RabbitMQ Management** | Broker dashboard at :15672 (chatmesh / chatmesh_secret) |

## Tech Stack

- **Backend**: FastAPI, FastStream, SQLAlchemy, RabbitMQ (RPC + Pub/Sub)
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, React Query
- **Infrastructure**: PostgreSQL, RabbitMQ, Nginx, Docker

## Inter-Service Communication

- **RPC** (via RabbitMQ): Synchronous calls — auth token verification, room member lookups
- **Pub/Sub** (via RabbitMQ topic exchange): Async events — new messages, typing indicators, presence
- **WebSocket**: Gateway ↔ Frontend for realtime delivery

## Quick Start

```bash
cp .env.example .env
docker-compose up --build
```

Open [http://localhost](http://localhost) in your browser.

## Features

- User registration and authentication (JWT + refresh tokens)
- httpOnly cookie auth with auto-refresh
- Create and join chat rooms
- Realtime messaging via WebSocket
- Typing indicators
- Online presence tracking
- Notifications for new messages
- Dark theme UI
