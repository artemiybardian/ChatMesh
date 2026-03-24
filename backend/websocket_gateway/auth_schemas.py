from pydantic import BaseModel


class VerifyTokenRequest(BaseModel):
    token: str


class VerifyTokenResponse(BaseModel):
    valid: bool
    user_id: int | None = None
    username: str | None = None
    email: str | None = None
    error: str | None = None


class UserInfo(BaseModel):
    user_id: int
    username: str
    email: str
