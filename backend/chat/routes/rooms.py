from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from dependencies import get_current_user
from auth_schemas import UserInfo
from models import Room, RoomMember
from schemas import RoomCreate, RoomResponse, RoomMemberResponse

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.post("", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
async def create_room(
    data: RoomCreate,
    user: UserInfo = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    room = Room(name=data.name, created_by=user.user_id)
    db.add(room)
    await db.flush()

    member = RoomMember(room_id=room.id, user_id=user.user_id)
    db.add(member)
    await db.commit()
    await db.refresh(room)

    return room


@router.get("", response_model=list[RoomResponse])
async def list_rooms(
    user: UserInfo = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Room)
        .join(RoomMember, Room.id == RoomMember.room_id)
        .where(RoomMember.user_id == user.user_id)
        .order_by(Room.created_at.desc())
    )
    return result.scalars().all()


@router.post("/{room_id}/join", status_code=status.HTTP_204_NO_CONTENT)
async def join_room(
    room_id: int,
    user: UserInfo = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    room = await db.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    existing = await db.execute(
        select(RoomMember).where(
            RoomMember.room_id == room_id,
            RoomMember.user_id == user.user_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Already a member")

    db.add(RoomMember(room_id=room_id, user_id=user.user_id))
    await db.commit()


@router.post("/{room_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
async def leave_room(
    room_id: int,
    user: UserInfo = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(RoomMember).where(
            RoomMember.room_id == room_id,
            RoomMember.user_id == user.user_id,
        )
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Not a member")

    await db.delete(member)
    await db.commit()


@router.get("/{room_id}/members", response_model=list[RoomMemberResponse])
async def get_members(
    room_id: int,
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

    result = await db.execute(
        select(RoomMember).where(RoomMember.room_id == room_id)
    )
    members = result.scalars().all()

    member_responses = []
    for m in members:
        member_responses.append(
            RoomMemberResponse(
                user_id=m.user_id,
                username=f"user_{m.user_id}",
                joined_at=m.joined_at,
            )
        )

    return member_responses
