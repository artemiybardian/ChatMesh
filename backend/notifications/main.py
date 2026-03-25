from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from broker import broker
from routes import router as notifications_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await broker.start()
    yield
    await broker.close()


app = FastAPI(title="ChatMesh Notifications Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notifications_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "notifications"}
