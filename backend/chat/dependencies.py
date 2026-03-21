from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from broker import broker
from auth_schemas import VerifyTokenRequest, VerifyTokenResponse, UserInfo

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInfo:
    response = await broker.publish(
        VerifyTokenRequest(token=token),
        queue="auth.verify-token",
        rpc=True,
        rpc_timeout=5.0,
    )

    data = VerifyTokenResponse.model_validate(response)

    if not data.valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=data.error or "Authentication failed",
        )

    return UserInfo(
        user_id=data.user_id,
        username=data.username,
        email=data.email,
    )
