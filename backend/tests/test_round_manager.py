from app.negotiation_engine.models import (
    NegotiationContext
)

from app.negotiation_engine.round_manager import (
    RoundManager
)


context = NegotiationContext(
    scenario="vendor_pricing",

    buyer_agent_id="buyer123",
    seller_agent_id="seller123",

    negotiation_subject="Laptop",

    initial_offer=45000,
    minimum_acceptable_offer=40000,
    target_offer=50000,

    max_rounds=5,

    buyer_strategy="Balanced",
    seller_strategy="Balanced"
)

manager = RoundManager(context)

round1 = manager.create_round(
    buyer_offer=45000,
    seller_counter_offer=50000,
    status="Counter Offer"
)

manager.add_round(round1)

print("Current Round:", manager.current_round)
print("Can Continue:", manager.can_continue())
print("History:", manager.get_history())

manager.next_round()

print("Next Round:", manager.current_round)