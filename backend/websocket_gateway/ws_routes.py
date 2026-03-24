import asyncio
import datetime
import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from faststream.rabbit import RabbitExchange, ExchangeType

from broker import broker
from auth_schemas import VerifyTokenRequest, VerifyTokenResponse
from event_schemas import NewMessageEvent
from manager import manager
from presence import publish_presence, heartbeat_loop

router = APIRouter()

chat_events_exchange = RabbitExchange("chat.events", type=ExchangeType.TOPIC, durable=True)


async def authenticate_ws(token: str) -> VerifyTokenResponse | None:
    try:
        response = await broker.publish(
            VerifyTokenRequest(token=token),
            queue="auth.verify-token",
            rpc=True,
            rpc_timeout=5.0,
        )
        return VerifyTokenResponse.model_validate(response)
    except Exception:
        return None


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    room_id: int = Query(...),
):
    auth = await authenticate_ws(token)
    if not auth or not auth.valid:
        await websocket.close(code=4001, reason="Authentication failed")
        return

    user_id = auth.user_id
    username = auth.username

    await manager.connect(websocket, user_id, room_id)
    await publish_presence(user_id, username, "online")

    heartbeat_task = asyncio.create_task(heartbeat_loop(websocket, user_id))

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            action = payload.get("type", "message")

            if action == "pong":
                continue

            if action == "message":
                now = datetime.datetime.now(datetime.timezone.utc)
                event = NewMessageEvent(
                    room_id=room_id,
                    user_id=user_id,
                    username=username,
                    content=payload.get("content", ""),
                    created_at=now,
                )

                await broker.publish(
                    event,
                    exchange=chat_events_exchange,
                    routing_key="message.new",
                )

                await manager.broadcast_to_room(
                    room_id,
                    {
                        "type": "message:new",
                        "room_id": room_id,
                        "user_id": user_id,
                        "username": username,
                        "content": event.content,
                        "created_at": now.isoformat(),
                    },
                )

    except WebSocketDisconnect:
        pass
    finally:
        heartbeat_task.cancel()
        manager.disconnect(user_id, room_id)
        if not manager.is_user_online(user_id):
            await publish_presence(user_id, username, "offline")


@router.get("/online")
async def get_online_users():
    return {"online_users": manager.get_online_users()}
