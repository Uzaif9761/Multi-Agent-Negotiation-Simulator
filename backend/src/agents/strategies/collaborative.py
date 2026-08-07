from ..base import BaseAgent
from ..models import Offer, EvaluationResult


class CollaborativeAgent(BaseAgent):
    """
    A Collaborative Agent that makes generous concessions early on.
    It moves quickly towards a middle ground (or its reservation value)
    to facilitate a faster agreement.
    """

    def _calculate_value_for_round(self, round_num: int) -> float:
        """Calculate the offer value using a fast concession strategy (root curve)."""
        effective_round = min(round_num, self.config.max_rounds)
        
        if self.config.max_rounds <= 1:
            concession_factor = 1.0
        else:
            # Using a power < 1 means the concession factor grows quickly initially
            base_factor = (effective_round - 1) / (self.config.max_rounds - 1)
            concession_factor = base_factor ** 0.5

        value = self.config.target_value + (self.config.reservation_value - self.config.target_value) * concession_factor
        return round(value, 2)

    def generate_offer(self, round_num: int) -> Offer:
        value = self._calculate_value_for_round(round_num)
        
        if round_num == 1:
            message = f"I am proposing {value} to start, but I'm open to finding a win-win."
        elif round_num == self.config.max_rounds:
            message = f"I've made as many concessions as I can. My final offer is {value}."
        else:
            message = f"I want to reach an agreement. Let's move to {value}."
            
        return Offer(
            agent_id=self.config.agent_id,
            value=value,
            message=message,
            round_num=round_num
        )

    def evaluate_offer(self, offer: Offer, round_num: int) -> EvaluationResult:
        self.update_history(offer)
        
        expected_value = self._calculate_value_for_round(round_num)
        is_buyer = self.is_buyer()

        # Accepts if it's anywhere near the expected value or reservation value
        if is_buyer:
            is_acceptable = offer.value <= expected_value
            meets_reservation = offer.value <= self.config.reservation_value
        else:
            is_acceptable = offer.value >= expected_value
            meets_reservation = offer.value >= self.config.reservation_value

        if is_acceptable or meets_reservation:
            return EvaluationResult(accepted=True, reason="This works for me. We have a deal.")

        return EvaluationResult(accepted=False, reason="We are not quite there yet, let's keep trying.")
