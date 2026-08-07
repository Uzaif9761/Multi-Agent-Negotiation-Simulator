from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from enum import Enum

class AgentConfig(BaseModel):
    agent_id: str
    agent_type: str  # e.g., 'buyer', 'hr', 'candidate'
    goal: str
    constraints: str
    personality: str
    max_rounds: int
    extra_params: Optional[Dict[str, Any]] = None

class ActionType(str, Enum):
    OFFER = "OFFER"
    COUNTER_OFFER = "COUNTER_OFFER"
    ACCEPT = "ACCEPT"
    REJECT = "REJECT"
    WALK_AWAY = "WALK_AWAY"

class AgentAction(BaseModel):
    action_type: ActionType = Field(description="The type of action you are taking.")
    value: Optional[float] = Field(None, description="The numerical value of your offer, if making one.")
    message: str = Field(description="The verbal message you will say to the other party.")
    reasoning: str = Field(description="Your internal reasoning for this action.")
