import os
from backend.src.agents.factory import AgentFactory
from backend.src.agents.models import ActionType

def run_demo():
    print("=== LLM Agent Negotiation Simulation Demo ===")
    
    # Check for API key
    if not os.environ.get("GOOGLE_API_KEY"):
        print("WARNING: GOOGLE_API_KEY environment variable is not set.")
        print("The agents will fail to connect to Gemini without it.")
        print("Please set it using: $env:GOOGLE_API_KEY='your_key'")
        return
    
    print("Initializing HR Agent and Candidate Agent...\n")
    
    # 1. Create HR Agent
    hr_agent = AgentFactory.create_agent("hr", "HR_Alice", max_rounds=3)

    # 2. Create Candidate Agent
    candidate_agent = AgentFactory.create_agent("candidate", "Candidate_Bob", max_rounds=3)

    # 3. Simulate turns
    current_context = "HR_Alice is calling you to discuss your job offer. They are ready to begin."
    
    for round_num in range(1, 4):
        print(f"\n--- Round {round_num} ---")
        
        # Candidate goes first in this demo (or HR, let's let HR start)
        if round_num == 1:
            current_context = "You are starting the negotiation. Reach out to Candidate_Bob with an initial offer."
            
        # HR takes turn
        hr_action = hr_agent.take_turn(current_context)
        print(f"[HR_Alice / Internal Reasoning]: {hr_action.reasoning}")
        print(f"[HR_Alice]: {hr_action.message} (Action: {hr_action.action_type}, Value: {hr_action.value})")
        
        if hr_action.action_type in (ActionType.ACCEPT, ActionType.WALK_AWAY):
            print("Negotiation Ended by HR.")
            break
            
        current_context = hr_action.message
        
        # Candidate takes turn
        cand_action = candidate_agent.take_turn(current_context)
        print(f"[Candidate_Bob / Internal Reasoning]: {cand_action.reasoning}")
        print(f"[Candidate_Bob]: {cand_action.message} (Action: {cand_action.action_type}, Value: {cand_action.value})")
        
        if cand_action.action_type in (ActionType.ACCEPT, ActionType.WALK_AWAY):
            print("Negotiation Ended by Candidate.")
            break
            
        current_context = cand_action.message
            
    else:
        print("\n--- Negotiation Failed: No deal reached after 3 rounds ---")

if __name__ == "__main__":
    run_demo()
