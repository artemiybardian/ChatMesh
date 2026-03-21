from faststream.rabbit import RabbitRouter
from sqlalchemy import select

from database import async_session
from models import User
from rpc_schemas import (
    VerifyTokenRequest,
    VerifyTokenResponse,
    GetUserRequest,
    GetUserResponse,
)
from utils import verify_token

router = RabbitRouter()


@router.subscriber("auth.verify-token")
async def handle_verify_token(msg: VerifyTokenRequest) -> VerifyTokenResponse:
    payload = verify_token(msg.token)
    if payload is None:
        return VerifyTokenResponse(valid=False, error="Invalid or expired token")

    user_id = payload.get("user_id")
    username = payload.get("username")

    if user_id is None:
        return VerifyTokenResponse(valid=False, error="Invalid token payload")

    async with async_session() as db:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

    if user is None:
        return VerifyTokenResponse(valid=False, error="User not found")

    return VerifyTokenResponse(
        valid=True,
        user_id=user.id,
        username=user.username,
        email=user.email,
    )


@router.subscriber("auth.get-user")
async def handle_get_user(msg: GetUserRequest) -> GetUserResponse | dict:
    async with async_session() as db:
        result = await db.execute(select(User).where(User.id == msg.user_id))
        user = result.scalar_one_or_none()

    if user is None:
        return {"error": "User not found"}

    return GetUserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        is_active=user.is_active,
    )
