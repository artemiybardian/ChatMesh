from faststream.rabbit import RabbitQueue, RabbitExchange, RabbitRouter, ExchangeType

from event_schemas import NewMessageEvent
from manager import manager

router = RabbitRouter()

chat_events_exchange = RabbitExchange("chat.events", type=ExchangeType.TOPIC, durable=True)
broadcast_queue = RabbitQueue("gateway.broadcast", durable=False, exclusive=True)


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
