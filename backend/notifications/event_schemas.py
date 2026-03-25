import datetime

from pydantic import BaseModel


class NewMessageEvent(BaseModel):
    room_id: int
    user_id: int
    username: str
    content: str
    created_at: datetime.datetime | None = None


class GetRoomMembersRequest(BaseModel):
    room_id: int


class GetRoomMembersResponse(BaseModel):
    user_ids: list[int]
