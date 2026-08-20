from app.negotiation_engine.models import NegotiationContext
import sys
import os
import asyncio

# Add the root directory to path to import backend.src.agents
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
from backend.src.agents.factory import AgentFactory
from backend.src.agents.models import ActionType

def get_strategy_prompt(strategy_name: str, goal: float, limit: float, is_buyer: bool) -> str:
    base = f"Open the negotiation at {goal}."
    direction = "exceed" if is_buyer else "drop below"
    
    if strategy_name == "Aggressive":
        return f"{base} Be extremely stubborn and aggressive. Concede in very tiny increments. Your primary goal is to drag the negotiation out for as many rounds as possible to wear them down and maximize your value. Strongly resist moving towards your limit of {limit}."
    elif strategy_name == "Conservative":
        return f"{base} Be highly accommodating and friendly. You want to close the deal quickly in just a few rounds. Make large concessions if necessary to reach an agreement before hitting {limit}."
    else:
        return f"{base} Be balanced and collaborative. Make moderate concessions. Try not to {direction} {limit}."

class NegotiationEngine:
    def __init__(self, context: NegotiationContext):
        self.context = context

    async def start(self):
        # 1. Initialize LLM Agents with explicit financial parameters
        buyer_params = {
            "Goal Price (Best Case)": self.context.initial_offer,
            "Absolute Maximum Limit (Walk-Away)": self.context.minimum_acceptable_offer,
            "Strategy": get_strategy_prompt(self.context.buyer_strategy, self.context.initial_offer, self.context.minimum_acceptable_offer, True)
        }
        
        seller_params = {
            "Goal Price (Best Case)": self.context.target_offer,
            "Absolute Minimum Limit (Walk-Away)": self.context.minimum_acceptable_offer,
            "Strategy": get_strategy_prompt(self.context.seller_strategy, self.context.target_offer, self.context.minimum_acceptable_offer, False)
        }

        buyer = AgentFactory.create_agent(self.context.buyer_agent_id, "Buyer", max_rounds=self.context.max_rounds, extra_params=buyer_params)
        seller = AgentFactory.create_agent(self.context.seller_agent_id, "Seller", max_rounds=self.context.max_rounds, extra_params=seller_params)
        
        history_list = []
        current_context = f"We are negotiating over: {self.context.negotiation_subject}. You are the buyer. Make an initial offer."
        
        buyer_last_val = self.context.initial_offer
        seller_last_val = self.context.target_offer
        final_status = "failed"
        final_message = "Maximum rounds completed without an agreement."
        
        for round_num in range(1, self.context.max_rounds + 1):
            
            # Buyer Turn
            buyer_action = await asyncio.to_thread(buyer.take_turn, current_context)
            if buyer_action.value is not None:
                buyer_last_val = buyer_action.value
            
            if buyer_action.action_type == ActionType.ACCEPT:
                final_status = "success"
                final_message = "Buyer accepted the offer!"
                history_list.append({"round_number": round_num, "buyer_offer": buyer_last_val, "seller_counter_offer": seller_last_val, "status": "success", "buyer_message": buyer_action.message if hasattr(buyer_action, 'message') else "", "seller_message": ""})
                break
            elif buyer_action.action_type == ActionType.WALK_AWAY:
                final_status = "failed"
                final_message = "Buyer walked away."
                history_list.append({"round_number": round_num, "buyer_offer": buyer_last_val, "seller_counter_offer": seller_last_val, "status": "failed", "buyer_message": buyer_action.message if hasattr(buyer_action, 'message') else "", "seller_message": ""})
                break
                
            current_context = buyer_action.message
            
            # Seller Turn
            seller_action = await asyncio.to_thread(seller.take_turn, current_context)
            if seller_action.value is not None:
                seller_last_val = seller_action.value
            
            if seller_action.action_type == ActionType.ACCEPT:
                final_status = "success"
                final_message = "Seller accepted the offer!"
                history_list.append({"round_number": round_num, "buyer_offer": buyer_last_val, "seller_counter_offer": seller_last_val, "status": "success", "buyer_message": buyer_action.message if hasattr(buyer_action, 'message') else "", "seller_message": seller_action.message if hasattr(seller_action, 'message') else ""})
                break
            elif seller_action.action_type == ActionType.WALK_AWAY:
                final_status = "failed"
                final_message = "Seller walked away."
                history_list.append({"round_number": round_num, "buyer_offer": buyer_last_val, "seller_counter_offer": seller_last_val, "status": "failed", "buyer_message": buyer_action.message if hasattr(buyer_action, 'message') else "", "seller_message": seller_action.message if hasattr(seller_action, 'message') else ""})
                break
                
            current_context = seller_action.message
            
            # Append round to history
            history_list.append({
                "round_number": round_num, 
                "buyer_offer": buyer_last_val, 
                "seller_counter_offer": seller_last_val, 
                "status": "pending",
                "buyer_message": buyer_action.message if hasattr(buyer_action, 'message') else "",
                "seller_message": seller_action.message if hasattr(seller_action, 'message') else ""
            })

        return {
            "scenario": self.context.scenario,
            "subject": self.context.negotiation_subject,
            "history": history_list,
            "evaluation": {
                "status": final_status,
                "message": final_message,
                "final_offer": buyer_last_val
            }
        }
