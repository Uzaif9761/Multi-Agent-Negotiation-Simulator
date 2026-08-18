import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings
from datetime import datetime

MONGO_URI = settings.MONGO_URI
DATABASE_NAME = settings.DATABASE_NAME

async def seed_agents():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DATABASE_NAME]
    
    print("Clearing existing agents...")
    await db.agents.delete_many({})
    
    agents = [
        # Job Offer - Buyer
        {"name": "TechCorp HR (Aggressive)", "role": "buyer", "goal": "Hire the candidate for the absolute lowest possible salary. Concede very little.", "strategy": "Aggressive", "created_at": datetime.utcnow()},
        {"name": "TechCorp HR (Balanced)", "role": "buyer", "goal": "Hire the candidate for a fair market salary.", "strategy": "Balanced", "created_at": datetime.utcnow()},
        {"name": "TechCorp HR (Conservative)", "role": "buyer", "goal": "Ensure the candidate is hired quickly by offering generous compensation.", "strategy": "Conservative", "created_at": datetime.utcnow()},
        
        # Job Offer - Seller
        {"name": "Software Engineer (Aggressive)", "role": "seller", "goal": "Maximize base salary. Push hard for the highest possible offer.", "strategy": "Aggressive", "created_at": datetime.utcnow()},
        {"name": "Software Engineer (Balanced)", "role": "seller", "goal": "Negotiate a fair salary based on market averages.", "strategy": "Balanced", "created_at": datetime.utcnow()},
        {"name": "Software Engineer (Conservative)", "role": "seller", "goal": "Accept a reasonable offer quickly without risking the job.", "strategy": "Conservative", "created_at": datetime.utcnow()},

        # Vendor Pricing - Buyer
        {"name": "Global Retail (Aggressive)", "role": "buyer", "goal": "Squeeze the vendor for the absolute lowest unit price.", "strategy": "Aggressive", "created_at": datetime.utcnow()},
        {"name": "Global Retail (Balanced)", "role": "buyer", "goal": "Negotiate a fair unit price for bulk orders.", "strategy": "Balanced", "created_at": datetime.utcnow()},
        {"name": "Global Retail (Conservative)", "role": "buyer", "goal": "Secure the vendor contract quickly by agreeing to a higher price.", "strategy": "Conservative", "created_at": datetime.utcnow()},

        # Vendor Pricing - Seller
        {"name": "CloudHosting Inc (Aggressive)", "role": "seller", "goal": "Protect profit margins fiercely. Refuse to lower prices significantly.", "strategy": "Aggressive", "created_at": datetime.utcnow()},
        {"name": "CloudHosting Inc (Balanced)", "role": "seller", "goal": "Negotiate a mutually beneficial price that maintains reasonable margins.", "strategy": "Balanced", "created_at": datetime.utcnow()},
        {"name": "CloudHosting Inc (Conservative)", "role": "seller", "goal": "Secure the client by conceding easily on price.", "strategy": "Conservative", "created_at": datetime.utcnow()},

        # Budget Allocation - Buyer
        {"name": "Project Manager (Aggressive)", "role": "buyer", "goal": "Strictly limit the budget allocation to the bare minimum.", "strategy": "Aggressive", "created_at": datetime.utcnow()},
        {"name": "Project Manager (Balanced)", "role": "buyer", "goal": "Allocate a fair budget that covers necessary expenses without overspending.", "strategy": "Balanced", "created_at": datetime.utcnow()},
        {"name": "Project Manager (Conservative)", "role": "buyer", "goal": "Easily approve a higher budget to ensure the project has more than enough resources.", "strategy": "Conservative", "created_at": datetime.utcnow()},

        # Budget Allocation - Seller
        {"name": "Lead Developer (Aggressive)", "role": "seller", "goal": "Demand a massive budget to ensure zero constraints. Push back on any cuts.", "strategy": "Aggressive", "created_at": datetime.utcnow()},
        {"name": "Lead Developer (Balanced)", "role": "seller", "goal": "Request a reasonable budget and compromise on non-essentials.", "strategy": "Balanced", "created_at": datetime.utcnow()},
        {"name": "Lead Developer (Conservative)", "role": "seller", "goal": "Accept whatever budget is given and make do with fewer resources.", "strategy": "Conservative", "created_at": datetime.utcnow()},
    ]
    
    await db.agents.insert_many(agents)
    print(f"Successfully inserted {len(agents)} agents.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_agents())
