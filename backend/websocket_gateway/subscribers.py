from pydantic import BaseModel
from faststream.rabbit import RabbitQueue, RabbitExchange, RabbitRouter, ExchangeType

from event_schemas import NewMessageEvent
from manager import manager

router = RabbitRouter()

chat_events_exchange = RabbitExchange("chat.events", type=ExchangeType.TOPIC, durable=True)
broadcast_queue = RabbitQueue("gateway.broadcast", durable=False, exclusive=True)
typing_queue = RabbitQueue("gateway.typing", durable=False, exclusive=True)


class TypingEvent(BaseModel):
    room_id: int
    user_id: int
    username: str


@router.subscriber(broadcast_queue, chat_events_exchange, routing_key="message.new")
async def on_message_broadcast(msg: NewMessageEvent) -> None:
    await manager.broadcast_to_room(
        msg.room_id,
        {
            "type": "message:new",
            "room_id": msg.room_id,
            "user_id": msg.user_id,
            "username": msg.username,
            "content": msg.content,
            "created_at": msg.created_at.isoformat() if msg.created_at else None,
        },
    )


@router.subscriber(typing_queue, chat_events_exchange, routing_key="typing.*")
async def on_typing_broadcast(msg: TypingEvent) -> None:
    action = "typing:start"
    await manager.broadcast_to_room(
        msg.room_id,
        {"type": action, "room_id": msg.room_id, "user_id": msg.user_id, "username": msg.username},
        exclude_user=msg.user_id,
    )
