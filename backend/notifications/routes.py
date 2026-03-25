from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from dependencies import get_current_user
from auth_schemas import UserInfo
from models import Notification
from schemas import NotificationResponse, NotificationListResponse

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    limit: int = 50,
    offset: int = 0,
    user: UserInfo = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    total_q = await db.execute(
        select(func.count()).where(Notification.user_id == user.user_id)
    )
    total = total_q.scalar() or 0

    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user.user_id)
        .order_by(Notification.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    items = result.scalars().all()
    return NotificationListResponse(items=items, total=total)


@router.post("/{notification_id}/read", response_model=NotificationResponse)
async def mark_read(
    notification_id: int,
    user: UserInfo = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user.user_id,
        )
    )
    notif = result.scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = True
    await db.commit()
    await db.refresh(notif)
    return notif


@router.post("/read-all", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_read(
    user: UserInfo = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        update(Notification)
        .where(Notification.user_id == user.user_id, Notification.is_read == False)  # noqa: E712
        .values(is_read=True)
    )
    await db.commit()
