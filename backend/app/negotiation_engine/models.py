from pydantic import BaseModel


class NegotiationContext(BaseModel):

    scenario: str

    buyer_agent_id: str

    seller_agent_id: str

    negotiation_subject: str

    initial_offer: float

    target_offer: float

    max_rounds: int = 5

    buyer_strategy: str = "Balanced"

    seller_strategy: str = "Balanced"



class NegotiationRound(BaseModel):

    round_number: int

    buyer_offer: float

    seller_counter_offer: float
    buyer_message: str = ""
    seller_message: str = ""
    status: str