import datetime

from pydantic import BaseModel


class RoomCreate(BaseModel):
    name: str


class RoomResponse(BaseModel):
    id: int
    name: str
    created_by: int
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


class RoomMemberResponse(BaseModel):
    user_id: int
    username: str
    joined_at: datetime.datetime


class MessageResponse(BaseModel):
    id: int
    room_id: int
    user_id: int
    username: str
    content: str
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


class MessageListResponse(BaseModel):
    messages: list[MessageResponse]
    total: int
    page: int
    limit: int
