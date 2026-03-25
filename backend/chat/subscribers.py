import datetime

from pydantic import BaseModel
from faststream.rabbit import RabbitQueue, RabbitExchange, RabbitRouter, ExchangeType
from sqlalchemy import select

from database import async_session
from models import Message, RoomMember
from event_schemas import NewMessageEvent

router = RabbitRouter()

chat_events_exchange = RabbitExchange("chat.events", type=ExchangeType.TOPIC, durable=True)
persist_queue = RabbitQueue("chat.message-persist", durable=True)


class GetRoomMembersRequest(BaseModel):
    room_id: int


class GetRoomMembersResponse(BaseModel):
    user_ids: list[int]


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


@router.subscriber("chat.get-room-members")
async def handle_get_room_members(msg: GetRoomMembersRequest) -> GetRoomMembersResponse:
    async with async_session() as db:
        result = await db.execute(
            select(RoomMember.user_id).where(RoomMember.room_id == msg.room_id)
        )
        user_ids = list(result.scalars().all())
    return GetRoomMembersResponse(user_ids=user_ids)
