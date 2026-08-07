import yaml
import os
from .base_llm import BaseLLMAgent
from .models import AgentConfig

class AgentFactory:
    """
    Factory for creating LLM-backed negotiation agents based on dynamic YAML profiles.
    """

    @staticmethod
    def create_agent(agent_type: str, agent_id: str, max_rounds: int = 5, extra_params=None) -> BaseLLMAgent:
        """
        Create and return an agent instance based on the role name found in agent_profiles.yaml.
        """
        agent_type = agent_type.lower().strip()
        
        # Determine path to config
        current_dir = os.path.dirname(os.path.abspath(__file__))
        config_path = os.path.join(current_dir, "config", "agent_profiles.yaml")
        
        with open(config_path, "r") as f:
            profiles = yaml.safe_load(f)
            
        # Mapping frontend display roles to YAML profile keys
        role_mapping = {
            "buyer": "buyer",
            "supplier": "vendor",
            "vendor": "vendor",
            "candidate": "candidate",
            "hiring_manager": "hr",
            "hr": "hr",
            "marketing_dept": "department_head",
            "engineering_dept": "department_head",
            "department_head": "department_head",
            "seller": "seller"
        }
        
        # Standardize key (e.g. "department head" -> "department_head")
        profile_key = agent_type.replace(" ", "_")
        
        # Resolve mapped key or fallback to a generic buyer/seller based on context, or default to buyer
        mapped_key = role_mapping.get(profile_key, "buyer")
        
        if mapped_key not in profiles:
            mapped_key = "buyer" # Safe fallback so it never crashes the simulation
            
        profile = profiles[mapped_key]
        
        config = AgentConfig(
            agent_id=agent_id,
            agent_type=profile["agent_type"],
            goal=profile["goal"],
            constraints=profile["constraints"],
            personality=profile["personality"],
            max_rounds=max_rounds,
            extra_params=extra_params or {}
        )
        
        return BaseLLMAgent(config)

    @staticmethod
    def get_available_agents():
        current_dir = os.path.dirname(os.path.abspath(__file__))
        config_path = os.path.join(current_dir, "config", "agent_profiles.yaml")
        with open(config_path, "r") as f:
            profiles = yaml.safe_load(f)
            
        agent_list = []
        for key, profile in profiles.items():
            # Standardize role for frontend: buyer or seller
            # Buyer wants low price (HR buying labor, Department Head keeping budget low? No, Dept Head wants high budget! So Dept Head is Seller!)
            # Candidate wants high salary (Seller of labor). HR wants low salary (Buyer of labor).
            role = "buyer" if key in ["buyer", "hr"] else "seller"
            agent_list.append({
                "_id": key,
                "name": profile["agent_type"],
                "role": role,
                "goal": profile["goal"],
                "strategy": "Balanced"
            })
        return agent_list
