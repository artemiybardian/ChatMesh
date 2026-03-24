import asyncio

from fastapi import WebSocket
from faststream.rabbit import RabbitExchange, ExchangeType

from broker import broker

presence_exchange = RabbitExchange("presence.events", type=ExchangeType.TOPIC, durable=True)

HEARTBEAT_INTERVAL = 30


async def publish_presence(user_id: int, username: str, status: str):
    await broker.publish(
        {"user_id": user_id, "username": username, "status": status},
        exchange=presence_exchange,
        routing_key=f"presence.{status}",
    )


async def heartbeat_loop(websocket: WebSocket, user_id: int):
    try:
        while True:
            await asyncio.sleep(HEARTBEAT_INTERVAL)
            await websocket.send_json({"type": "ping"})
    except Exception:
        pass
