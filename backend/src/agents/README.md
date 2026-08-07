# AI Agents Module

This module provides the AI Agents for the Creation of AI Driven Multi-Agent Negotiation Training & Simulation Platform.

## Overview

The agents are responsible for generating negotiation offers and evaluating offers from other agents. They are designed to be instantiated dynamically by the Orchestrator (Member 5) using the `AgentFactory`.

## Data Models (`models.py`)

- **`AgentConfig`**: Defines the configuration for an agent.
  - `agent_id`: Unique identifier.
  - `agent_type`: Strategy name (`'competitive'`, `'collaborative'`, `'neutral'`).
  - `role`: Role of the agent (`'buyer'`, `'seller'`, etc.). Buyers seek lower values, sellers seek higher values.
  - `target_value`: The ideal value the agent wants to achieve.
  - `reservation_value`: The walk-away point (maximum for buyer, minimum for seller).
  - `max_rounds`: The maximum number of negotiation rounds.
  - `extra_params`: Optional dictionary for additional parameters.

- **`Offer`**: Represents a negotiation offer.
  - `agent_id`: ID of the agent making the offer.
  - `value`: The numeric value of the offer (e.g., price, salary).
  - `message`: Text message accompanying the offer.
  - `round_num`: The current negotiation round.

- **`EvaluationResult`**: Result of evaluating an offer.
  - `accepted`: Boolean indicating if the offer was accepted.
  - `reason`: Explanation for the decision.

## Usage Example (For Member 5 - Orchestrator)

```python
from backend.src.agents.models import AgentConfig, Offer
from backend.src.agents.factory import AgentFactory

# 1. Configure and Create Agents
buyer_config = AgentConfig(
    agent_id="buyer_1",
    agent_type="competitive",
    role="buyer",
    target_value=100.0,
    reservation_value=150.0,
    max_rounds=5
)
seller_config = AgentConfig(
    agent_id="seller_1",
    agent_type="collaborative",
    role="seller",
    target_value=200.0,
    reservation_value=120.0,
    max_rounds=5
)

buyer_agent = AgentFactory.create_agent(buyer_config)
seller_agent = AgentFactory.create_agent(seller_config)

# 2. Generate an Offer (Round 1)
offer1 = buyer_agent.generate_offer(round_num=1)
print(f"Buyer offers: {offer1.value} - '{offer1.message}'")

# 3. Evaluate the Offer
result = seller_agent.evaluate_offer(offer1, round_num=1)
if result.accepted:
    print("Seller accepted!")
else:
    print(f"Seller rejected: {result.reason}")
    
    # 4. Generate Counter-Offer
    offer2 = seller_agent.generate_offer(round_num=1)
    print(f"Seller counters: {offer2.value} - '{offer2.message}'")
```

## Agent Strategies

1. **CompetitiveAgent (`'competitive'`)**: Makes very small concessions initially. Holds close to its target value and only moves significantly towards the reservation value as time runs out (power curve).
2. **CollaborativeAgent (`'collaborative'`)**: Makes generous concessions early on. Moves quickly towards a middle ground to facilitate a faster agreement (root curve).
3. **NeutralAgent (`'neutral'`)**: Makes steady, linear concessions over the allowed rounds.
