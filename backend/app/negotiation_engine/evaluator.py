from app.negotiation_engine.models import NegotiationRound


class NegotiationEvaluator:

    def evaluate(
        self,
        negotiation_round: NegotiationRound,
        max_rounds: int
    ) -> dict:

        buyer_offer = negotiation_round.buyer_offer
        seller_offer = negotiation_round.seller_counter_offer
        current_round = negotiation_round.round_number

        # Agreement reached
        if buyer_offer >= seller_offer:

            return {
                "status": "success",
                "message": "Negotiation completed successfully.",
                "final_offer": seller_offer
            }

        # Maximum rounds reached
        if current_round >= max_rounds:

            return {
                "status": "failed",
                "message": "Maximum negotiation rounds reached.",
                "final_offer": buyer_offer
            }

        # Continue negotiation
        return {
            "status": "continue",
            "message": "Proceeding to next negotiation round.",
            "final_offer": None
        }