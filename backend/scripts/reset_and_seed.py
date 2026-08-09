import asyncio
import sys
import os

# Add backend directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings
from app.utils.password import hash_password
from datetime import datetime

MONGO_URI = settings.MONGO_URI
DATABASE_NAME = settings.DATABASE_NAME

async def reset_and_seed():
    print(f"Connecting to MongoDB database: {DATABASE_NAME}")
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DATABASE_NAME]
    
    print("Clearing existing users, agents, and reports (negotiations)...")
    await db.users.delete_many({})
    await db.agents.delete_many({})
    await db.negotiations.delete_many({})
    
    # 1. Create 2 dummy users
    print("Creating dummy users...")
    users = [
        {
            "name": "Admin User",
            "email": "admin@example.com",
            "password": hash_password("admin123"),
            "created_at": datetime.utcnow()
        },
        {
            "name": "Test User",
            "email": "test@example.com",
            "password": hash_password("test1234"),
            "created_at": datetime.utcnow()
        }
    ]
    await db.users.insert_many(users)
    print("Dummy users inserted: admin@example.com (admin123), test@example.com (test1234)")
    
    # 2. Create accurate dummy agents for scenarios: Job Offer, Vendor Pricing, Budget Allocation
    print("Creating accurate dummy agents for all scenarios...")
    agents = [
        # Job Offer Scenario Agents
        {
            "name": "TechCorp HR (Job Offer - Buyer)",
            "role": "buyer",
            "goal": "Hire the candidate for the lowest salary while remaining competitive and offering standard benefits.",
            "strategy": "Balanced",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Senior Software Engineer (Job Offer - Seller)",
            "role": "seller",
            "goal": "Maximize base salary, secure a signing bonus, and negotiate flexible working hours.",
            "strategy": "Aggressive",
            "created_at": datetime.utcnow()
        },
        
        # Vendor Pricing Scenario Agents
        {
            "name": "Global Retailers Procurement (Vendor - Buyer)",
            "role": "buyer",
            "goal": "Secure the lowest unit price for bulk orders, negotiate net-60 payment terms, and ensure high SLA guarantees.",
            "strategy": "Aggressive",
            "created_at": datetime.utcnow()
        },
        {
            "name": "CloudHosting Inc. (Vendor - Seller)",
            "role": "seller",
            "goal": "Protect profit margins, avoid long payment terms, and upsell premium support tiers.",
            "strategy": "Conservative",
            "created_at": datetime.utcnow()
        },
        
        # Budget Allocation Scenario Agents
        {
            "name": "Marketing Department Head (Budget - Buyer/Requester)",
            "role": "buyer",
            "goal": "Maximize Q3 budget allocation to fund upcoming product launch campaigns.",
            "strategy": "Aggressive",
            "created_at": datetime.utcnow()
        },
        {
            "name": "CFO / Finance Committee (Budget - Seller/Approver)",
            "role": "seller",
            "goal": "Minimize budget overruns and ensure requested funds are tied strictly to ROI projections.",
            "strategy": "Conservative",
            "created_at": datetime.utcnow()
        },
        
        # Additional Flexible Agents
        {
            "name": "Mediator Bot (Flexible)",
            "role": "buyer",
            "goal": "Reach an agreement quickly that makes both parties reasonably satisfied without prolonged negotiation.",
            "strategy": "Balanced",
            "created_at": datetime.utcnow()
        }
    ]
    await db.agents.insert_many(agents)
    print(f"Successfully inserted {len(agents)} dummy agents.")
    
    client.close()
    print("Reset and seed complete!")

if __name__ == "__main__":
    asyncio.run(reset_and_seed())
