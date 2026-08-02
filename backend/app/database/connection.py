from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "negotiation_db")

client = AsyncIOMotorClient(MONGO_URI)

database = client[DATABASE_NAME]


async def get_database():
    return database