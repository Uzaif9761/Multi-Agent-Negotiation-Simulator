from app.negotiation_engine.models import (
    NegotiationContext,
    NegotiationRound
)


class RoundManager:

    def __init__(
        self,
        context: NegotiationContext
    ):

        self.context = context
        self.current_round = 1
        self.rounds = []


    def create_round(
        self,
        buyer_offer: float,
        seller_counter_offer: float,
        status: str
    ) -> NegotiationRound:

        return NegotiationRound(

            round_number=self.current_round,

            buyer_offer=buyer_offer,

            seller_counter_offer=seller_counter_offer,

            status=status
        )


    def add_round(
        self,
        negotiation_round: NegotiationRound
    ):

        self.rounds.append(
            negotiation_round
        )


    def can_continue(self) -> bool:

        return (
            self.current_round
            <= self.context.max_rounds
        )


    def next_round(self):

        if self.can_continue():

            self.current_round += 1


    def get_history(self):

        return self.rounds