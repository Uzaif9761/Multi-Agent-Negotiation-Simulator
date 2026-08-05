from app.negotiation_engine.models import NegotiationRound


class NegotiationHistory:

    def __init__(self):

        self.history = []


    def add_round(
        self,
        negotiation_round: NegotiationRound
    ):

        self.history.append(negotiation_round)


    def get_history(self):

        return self.history


    def last_round(self):

        if not self.history:
            return None

        return self.history[-1]


    def total_rounds(self):

        return len(self.history)


    def clear(self):

        self.history.clear()