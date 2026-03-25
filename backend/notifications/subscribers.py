from faststream.rabbit import RabbitQueue, RabbitExchange, RabbitRouter, ExchangeType

from broker import broker
from database import async_session
from models import Notification
from event_schemas import NewMessageEvent, GetRoomMembersRequest, GetRoomMembersResponse

router = RabbitRouter()

chat_events_exchange = RabbitExchange("chat.events", type=ExchangeType.TOPIC, durable=True)
notif_queue = RabbitQueue("notifications.messages", durable=True)


@router.subscriber(notif_queue, chat_events_exchange, routing_key="message.new")
async def on_new_message(msg: NewMessageEvent) -> None:
    response = await broker.publish(
        GetRoomMembersRequest(room_id=msg.room_id),
        queue="chat.get-room-members",
        rpc=True,
        rpc_timeout=5.0,
    )
    members = GetRoomMembersResponse.model_validate(response)

    async with async_session() as db:
        for uid in members.user_ids:
            if uid == msg.user_id:
                continue
            notification = Notification(
                user_id=uid,
                type="new_message",
                title=f"New message from {msg.username}",
                body=msg.content[:200],
                room_id=msg.room_id,
            )
            db.add(notification)
        await db.commit()
