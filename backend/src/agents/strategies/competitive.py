from ..base import BaseAgent
from ..models import Offer, EvaluationResult


class CompetitiveAgent(BaseAgent):
    """
    A Competitive Agent that makes very small concessions initially.
    It holds close to its target value for most of the negotiation,
    conceding towards the reservation value only as time runs out.
    """

    def _calculate_value_for_round(self, round_num: int) -> float:
        """Calculate the offer value using a slow concession strategy (power curve)."""
        effective_round = min(round_num, self.config.max_rounds)
        
        if self.config.max_rounds <= 1:
            concession_factor = 1.0
        else:
            # Using a power > 1 means the concession factor stays low until the later rounds
            base_factor = (effective_round - 1) / (self.config.max_rounds - 1)
            concession_factor = base_factor ** 3

        value = self.config.target_value + (self.config.reservation_value - self.config.target_value) * concession_factor
        return round(value, 2)

    def generate_offer(self, round_num: int) -> Offer:
        value = self._calculate_value_for_round(round_num)
        
        if round_num == 1:
            message = f"My opening offer is {value}. This is a very strong position."
        elif round_num == self.config.max_rounds:
            message = f"This is absolutely my final offer: {value}. Take it or leave it."
        else:
            message = f"I am willing to adjust slightly to {value}, but no further."
            
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

        # A competitive agent might require the opponent's offer to be even better than their own expected value,
        # but for simplicity, we'll accept if it meets our current expected value.
        if is_buyer:
            is_acceptable = offer.value <= expected_value
            meets_reservation = offer.value <= self.config.reservation_value
        else:
            is_acceptable = offer.value >= expected_value
            meets_reservation = offer.value >= self.config.reservation_value

        if is_acceptable:
            return EvaluationResult(accepted=True, reason="The offer meets my strict requirements.")
        
        if meets_reservation and round_num >= self.config.max_rounds:
            return EvaluationResult(accepted=True, reason="We are out of time. I will begrudgingly accept.")

        return EvaluationResult(accepted=False, reason="Your offer is far from acceptable.")
