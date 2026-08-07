from typing import List, Optional, Dict, Literal

from pydantic import BaseModel, Field, ConfigDict



class NegotiationRequest(BaseModel):

    model_config = ConfigDict(
        extra="forbid"
    )


    scenario: Literal[
        "job_offer",
        "vendor_pricing",
        "budget_allocation"
    ]


    buyer_agent_id: str

    seller_agent_id: str

    negotiation_subject: str


    initial_offer: float = Field(
        gt=0
    )


    minimum_acceptable_offer: float = Field(
        gt=0
    )


    target_offer: float = Field(
        gt=0
    )


    max_rounds: int = Field(
        default=5,
        ge=1,
        le=20
    )


    buyer_strategy: Literal[
        "Aggressive",
        "Balanced",
        "Conservative"
    ] = "Balanced"


    seller_strategy: Literal[
        "Aggressive",
        "Balanced",
        "Conservative"
    ] = "Balanced"




class NegotiationRoundResponse(BaseModel):

    round_number: int

    buyer_offer: float

    seller_counter_offer: float

    status: str

    buyer_message: Optional[str] = None

    seller_message: Optional[str] = None




class NegotiationResponse(BaseModel):

    model_config = ConfigDict(
        extra="ignore"
    )


    success: bool


    negotiation_id: Optional[str] = None


    status: str


    final_offer: Optional[float] = None


    message: str


    history: List[NegotiationRoundResponse] = Field(
        default_factory=list
    )


    strategies: Dict[str, str] = Field(
        default_factory=dict
    )

class PracticeTurnRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    # Original negotiation context (so we know the limits for the AI)
    scenario: str
    buyer_agent_id: str
    seller_agent_id: str
    negotiation_subject: str
    initial_offer: float
    minimum_acceptable_offer: float
    target_offer: float
    ai_limit: float
    ai_strategy: str = "Balanced"
    max_rounds: int
    
    # The history to reconstruct the AI memory
    history_data: List[Dict[str, str]]
    
    # The human's actual text message they just typed
    human_message: str

class PracticeTurnResponse(BaseModel):
    ai_message: str
    action_type: str
    value: float
    
class SavePracticeRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    scenario: str
    buyer_agent_id: str
    seller_agent_id: str
    negotiation_subject: str
    initial_offer: float
    target_offer: float
    status: str
    final_offer: float
    message: str
    history: List[dict]
    strategies: Dict[str, str]