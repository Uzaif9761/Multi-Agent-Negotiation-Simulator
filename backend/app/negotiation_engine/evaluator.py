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

        # Agreement reached: Buyer meets or exceeds Seller's counter offer
        if buyer_offer >= seller_offer:
            # Settle at midpoint or buyer's match
            final_settlement = round((buyer_offer + seller_offer) / 2.0, 2) if buyer_offer != seller_offer else buyer_offer

            return {
                "status": "success",
                "message": f"Negotiation completed successfully in Round {current_round}. Agreed settlement price: {final_settlement}",
                "final_offer": final_settlement
            }

        # Maximum rounds reached without consensus
        if current_round >= max_rounds:
            gap = round(seller_offer - buyer_offer, 2)
            return {
                "status": "failed",
                "message": f"Maximum negotiation rounds ({max_rounds}) reached without agreement. Final gap: {gap}",
                "final_offer": None
            }

        # Negotiation continues
        return {
            "status": "continue",
            "message": f"Round {current_round} completed. Counter offers exchanged. Proceeding to Round {current_round + 1}.",
            "final_offer": None
        }