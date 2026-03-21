# ChatMesh

Realtime chat application built on a microservice architecture.

## Architecture

| Service | Port | Description |
|---------|------|-------------|
| **auth** | 8001 | Authentication, JWT, user management |
| **chat** | 8002 | Rooms, messages, history |
| **websocket-gateway** | 8003 | WebSocket connections, realtime events |
| **notifications** | 8004 | Push notifications for offline users |
| **frontend** | 3000 | Next.js web application |
| **RabbitMQ Management** | 15672 | Broker dashboard (chatmesh / chatmesh_secret) |

## Tech Stack

- **Backend**: FastAPI, FastStream, SQLAlchemy, RabbitMQ (RPC + Pub/Sub)
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, React Query, React Hook Form, Zod
- **Infrastructure**: PostgreSQL, RabbitMQ, Docker

## Quick Start

```bash
docker-compose up --build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
