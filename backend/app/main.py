from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import database

from app.api.users import router as user_router
from app.api.agents import router as agent_router
from app.api.negotiations import router as negotiation_router
from app.api.analytics import router as analytics_router


app = FastAPI(
    title="Multi-Agent Negotiation Backend",
    version="1.0.0"
)


# CORS Configuration (Frontend Connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register Routers
app.include_router(user_router)
app.include_router(agent_router)
app.include_router(negotiation_router)
app.include_router(analytics_router)


@app.get("/")
def root():
    return {
        "message": "Backend is running successfully!"
    }


@app.get("/test-db")
async def test_db():

    try:
        await database.command("ping")

        return {
            "message": "MongoDB connection successful"
        }

    except Exception as e:

        return {
            "error": str(e)
        }