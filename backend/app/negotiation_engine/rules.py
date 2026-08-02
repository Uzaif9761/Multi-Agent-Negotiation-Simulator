from pydantic import BaseModel, Field


class NegotiationRules(BaseModel):
    """
    Defines the negotiation rules for a specific scenario.
    The engine should only depend on this object,
    not on scenario-specific logic.
    """

    minimum_acceptable_offer: float = Field(
        ...,
        description="Minimum value acceptable to the seller/company."
    )

    target_offer: float = Field(
        ...,
        description="Preferred target value."
    )

    max_rounds: int = Field(
        default=5,
        ge=1,
        description="Maximum number of negotiation rounds."
    )

    buyer_strategy: str = Field(
        ...,
        description="Buyer negotiation strategy."
    )

    seller_strategy: str = Field(
        ...,
        description="Seller negotiation strategy."
    )