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
    buyer_message: str = ""
    seller_message: str = ""
    status: str




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