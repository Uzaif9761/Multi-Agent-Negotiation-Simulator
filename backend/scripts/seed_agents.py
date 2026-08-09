import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# Add backend directory to sys.path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config.settings import settings

MONGO_URI = settings.MONGO_URI
DATABASE_NAME = settings.DATABASE_NAME

agents = [
    {
        "name": "Alex (Aggressive Buyer)",
        "role": "buyer",
        "goal": "Get the absolute lowest price possible",
        "strategy": "Aggressive"
    },
    {
        "name": "Sarah (Collaborative Buyer)",
        "role": "buyer",
        "goal": "Find a win-win deal that builds a long-term relationship",
        "strategy": "Balanced"
    },
    {
        "name": "Michael (Strict Seller)",
        "role": "seller",
        "goal": "Maximize profit margins at all costs",
        "strategy": "Aggressive"
    },
    {
        "name": "Emma (Flexible Seller)",
        "role": "seller",
        "goal": "Close the deal quickly with fair terms",
        "strategy": "Balanced"
    }
]

async def seed_agents():
    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DATABASE_NAME]
    
    print("Clearing existing agents...")
    await db.agents.delete_many({})
    
    print(f"Inserting {len(agents)} dummy agents...")
    result = await db.agents.insert_many(agents)
    
    print(f"Successfully inserted {len(result.inserted_ids)} agents.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_agents())
