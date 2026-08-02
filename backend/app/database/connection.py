from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

if not MONGO_URI:
    raise Exception("MONGO_URI not found in .env")

client = AsyncIOMotorClient(MONGO_URI)

database = client[DATABASE_NAME]


async def get_database():
    return database