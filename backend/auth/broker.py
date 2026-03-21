from faststream.rabbit import RabbitBroker

from config import settings

broker = RabbitBroker(settings.RABBITMQ_URL)

from rpc_handlers import router as rpc_router  # noqa: E402

broker.include_router(rpc_router)
