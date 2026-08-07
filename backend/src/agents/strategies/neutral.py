from ..base import BaseAgent
from ..models import Offer, EvaluationResult


class NeutralAgent(BaseAgent):
    """
    A Neutral Agent that makes linear concessions over the allowed rounds.
    It moves steadily from its target value to its reservation value.
    """

    def _calculate_value_for_round(self, round_num: int) -> float:
        """Calculate the offer value using a linear concession strategy."""
        # Ensure we don't exceed max_rounds
        effective_round = min(round_num, self.config.max_rounds)
        
        # In round 1, it should ideally be the target value (or close to it)
        # Let's say round 1 is 0% concession, round max_rounds is 100% concession
        if self.config.max_rounds <= 1:
            concession_factor = 1.0
        else:
            concession_factor = (effective_round - 1) / (self.config.max_rounds - 1)

        value = self.config.target_value + (self.config.reservation_value - self.config.target_value) * concession_factor
        return round(value, 2)

    def generate_offer(self, round_num: int) -> Offer:
        value = self._calculate_value_for_round(round_num)
        message = f"I believe {value} is a fair compromise."
        if round_num == 1:
            message = f"My initial proposal is {value}."
        elif round_num == self.config.max_rounds:
            message = f"This is my final offer: {value}."
            
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

        # Buyer wants offer.value <= expected_value
        # Seller wants offer.value >= expected_value
        if is_buyer:
            is_acceptable = offer.value <= expected_value
            meets_reservation = offer.value <= self.config.reservation_value
        else:
            is_acceptable = offer.value >= expected_value
            meets_reservation = offer.value >= self.config.reservation_value

        if is_acceptable:
            return EvaluationResult(accepted=True, reason="The offer meets my current expectations.")
        
        if meets_reservation and round_num >= self.config.max_rounds:
            return EvaluationResult(accepted=True, reason="We are out of time, but this meets my absolute limit.")

        return EvaluationResult(accepted=False, reason="The offer is not acceptable at this stage.")
