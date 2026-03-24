import datetime

from faststream.rabbit import RabbitQueue, RabbitExchange, RabbitRouter, ExchangeType

from database import async_session
from models import Message
from event_schemas import NewMessageEvent

router = RabbitRouter()

chat_events_exchange = RabbitExchange("chat.events", type=ExchangeType.TOPIC, durable=True)
persist_queue = RabbitQueue("chat.message-persist", durable=True)


@router.subscriber(persist_queue, chat_events_exchange, routing_key="message.new")
async def on_new_message(msg: NewMessageEvent) -> None:
    async with async_session() as db:
        message = Message(
            room_id=msg.room_id,
            user_id=msg.user_id,
            username=msg.username,
            content=msg.content,
            created_at=msg.created_at or datetime.datetime.now(datetime.timezone.utc),
        )
        db.add(message)
        await db.commit()
