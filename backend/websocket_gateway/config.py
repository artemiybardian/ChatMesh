from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    RABBITMQ_URL: str = "amqp://chatmesh:chatmesh_secret@localhost:5672/"

    class Config:
        env_file = ".env"


settings = Settings()
