from faststream.rabbit import RabbitBroker

from config import settings

broker = RabbitBroker(settings.RABBITMQ_URL)

from subscribers import router as sub_router  # noqa: E402

broker.include_router(sub_router)
