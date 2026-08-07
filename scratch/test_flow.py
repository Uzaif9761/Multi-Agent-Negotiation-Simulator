import asyncio
import httpx
import json

async def main():
    async with httpx.AsyncClient() as client:
        print("1. Fetching current negotiations...")
        res = await client.get("http://localhost:8000/negotiations/")
        data = res.json()
        print(f"Total negotiations: {len(data['data'])}")
        if len(data['data']) > 0:
            print(f"Newest ID: {data['data'][0]['_id']}")

        print("\n2. Starting new negotiation (this will take a few seconds)...")
        payload = {
          "scenario": "vendor_pricing",
          "buyer_agent_id": "Buyer",
          "seller_agent_id": "Seller",
          "negotiation_subject": "Vendor Pricing Negotiation",
          "initial_offer": 100, 
          "minimum_acceptable_offer": 200,
          "target_offer": 300,
          "max_rounds": 5,
          "buyer_strategy": "Balanced",
          "seller_strategy": "Balanced"
        }
        res2 = await client.post("http://localhost:8000/negotiations/start", json=payload, timeout=60.0)
        data2 = res2.json()
        new_id = data2.get("negotiation_id", "NOT_FOUND")
        print(f"New negotiation created with ID: {new_id}")

        print("\n3. Fetching current negotiations again...")
        res3 = await client.get("http://localhost:8000/negotiations/")
        data3 = res3.json()
        print(f"Total negotiations: {len(data3['data'])}")
        if len(data3['data']) > 0:
            print(f"Newest ID: {data3['data'][0]['_id']}")

asyncio.run(main())
