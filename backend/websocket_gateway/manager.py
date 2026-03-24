import json

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.room_connections: dict[int, dict[int, WebSocket]] = {}
        self.user_rooms: dict[int, set[int]] = {}

    async def connect(self, websocket: WebSocket, user_id: int, room_id: int):
        await websocket.accept()

        if room_id not in self.room_connections:
            self.room_connections[room_id] = {}
        self.room_connections[room_id][user_id] = websocket

        if user_id not in self.user_rooms:
            self.user_rooms[user_id] = set()
        self.user_rooms[user_id].add(room_id)

    def disconnect(self, user_id: int, room_id: int):
        if room_id in self.room_connections:
            self.room_connections[room_id].pop(user_id, None)
            if not self.room_connections[room_id]:
                del self.room_connections[room_id]

        if user_id in self.user_rooms:
            self.user_rooms[user_id].discard(room_id)
            if not self.user_rooms[user_id]:
                del self.user_rooms[user_id]

    async def broadcast_to_room(self, room_id: int, data: dict, exclude_user: int | None = None):
        connections = self.room_connections.get(room_id, {})
        message = json.dumps(data, default=str)
        dead = []
        for uid, ws in connections.items():
            if uid == exclude_user:
                continue
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(uid)
        for uid in dead:
            self.disconnect(uid, room_id)

    def get_online_users(self) -> list[int]:
        return list(self.user_rooms.keys())

    def is_user_online(self, user_id: int) -> bool:
        return user_id in self.user_rooms


manager = ConnectionManager()
