import requests
import time

payload = {
    "scenario": "job_offer",
    "buyer_agent_id": "Candidate",
    "seller_agent_id": "Hiring Manager",
    "negotiation_subject": "Job Offer Negotiation",
    "initial_offer": 2500000,
    "minimum_acceptable_offer": 2000000,
    "target_offer": 2200000,
    "max_rounds": 15,
    "buyer_strategy": "Balanced",
    "seller_strategy": "Aggressive"
}

start = time.time()
try:
    print("Starting simulation...")
    res = requests.post("http://localhost:8000/negotiations/start", json=payload)
    print(f"Status Code: {res.status_code}")
    print(f"Response: {res.json()}")
except Exception as e:
    print(f"Error: {e}")
finally:
    print(f"Time taken: {time.time() - start:.2f} seconds")
