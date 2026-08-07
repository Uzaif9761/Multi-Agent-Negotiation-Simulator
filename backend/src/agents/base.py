from abc import ABC, abstractmethod
from typing import List
from .models import AgentConfig, Offer, EvaluationResult


class BaseAgent(ABC):
    def __init__(self, config: AgentConfig):
        self.config = config
        self.history: List[Offer] = []

    def update_history(self, offer: Offer):
        """Record an offer in the negotiation history."""
        self.history.append(offer)

    def is_buyer(self) -> bool:
        """Helper to determine if the agent is acting as a buyer.
        Buyers want lower values, sellers want higher values.
        """
        # A simple heuristic: if target < reservation, it's a buyer (wants less).
        # Alternatively, rely on role string.
        role = self.config.role.lower()
        if 'buyer' in role or 'employer' in role or 'company' in role:
            return True
        if 'seller' in role or 'candidate' in role or 'employee' in role or 'supplier' in role:
            return False
        
        # Fallback based on values
        return self.config.target_value < self.config.reservation_value

    @abstractmethod
    def generate_offer(self, round_num: int) -> Offer:
        """Generate a new offer for the current round."""
        pass

    @abstractmethod
    def evaluate_offer(self, offer: Offer, round_num: int) -> EvaluationResult:
        """Evaluate an offer received from another agent."""
        pass
