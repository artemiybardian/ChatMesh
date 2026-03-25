from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://chatmesh:chatmesh_secret@localhost:5432/chatmesh_notifications"
    RABBITMQ_URL: str = "amqp://chatmesh:chatmesh_secret@localhost:5672/"

    class Config:
        env_file = ".env"


settings = Settings()
