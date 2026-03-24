from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from dependencies import get_current_user
from auth_schemas import UserInfo
from models import Message, RoomMember
from schemas import MessageResponse, MessageListResponse

router = APIRouter(prefix="/rooms/{room_id}/messages", tags=["messages"])


@router.get("", response_model=MessageListResponse)
async def get_messages(
    room_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    user: UserInfo = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    membership = await db.execute(
        select(RoomMember).where(
            RoomMember.room_id == room_id,
            RoomMember.user_id == user.user_id,
        )
    )
    if not membership.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a member of this room")

    total_result = await db.execute(
        select(func.count()).select_from(Message).where(Message.room_id == room_id)
    )
    total = total_result.scalar()

    offset = (page - 1) * limit
    result = await db.execute(
        select(Message)
        .where(Message.room_id == room_id)
        .order_by(Message.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    messages = result.scalars().all()

    return MessageListResponse(
        messages=list(reversed(messages)),
        total=total,
        page=page,
        limit=limit,
    )
