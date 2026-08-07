"""Agent factory fallback implementation.

Member 4 can replace this with model-backed agents. This version returns a
rule-based agent that produces deterministic negotiation actions.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict


@dataclass(slots=True)
class RuleBasedAgent:
    name: str
    agent_type: str

    def respond(self, context: Dict[str, Any]) -> Dict[str, Any]:
        history = context.get("history", [])
        last_offer = context.get("last_offer")
        round_number = int(context.get("round_number", 1))

        if last_offer and self.agent_type == "collaborative":
            return {
                "action": "accept",
                "message": f"{self.name} accepts the latest terms.",
                "offer": last_offer,
            }

        if self.agent_type == "competitive":
            base = 100000 - (round_number * 1500)
            return {
                "action": "offer",
                "message": f"{self.name} proposes a firm price.",
                "offer": {"price": max(base, 70000), "terms": {"delivery_days": 30}},
            }

        adjusted_price = 95000 - (len(history) * 500)
        return {
            "action": "counter",
            "message": f"{self.name} counters with a balanced position.",
            "offer": {"price": max(adjusted_price, 76000), "terms": {"delivery_days": 35}},
        }


class AgentFactory:
    """Factory for creating agent instances."""

    @staticmethod
    def create_agent(agent_type: str, name: str, **_: Any) -> RuleBasedAgent:
        return RuleBasedAgent(name=name, agent_type=agent_type)
