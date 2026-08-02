from app.negotiation_engine.models import NegotiationContext
from app.negotiation_engine.round_manager import RoundManager
from app.negotiation_engine.strategy import StrategyManager
from app.negotiation_engine.evaluator import NegotiationEvaluator
from app.negotiation_engine.history import NegotiationHistory


class NegotiationEngine:

    def __init__(
        self,
        context: NegotiationContext
    ):

        self.context = context

        self.round_manager = RoundManager(
            context
        )

        self.strategy_manager = StrategyManager()

        self.evaluator = NegotiationEvaluator()

        self.history = NegotiationHistory()



    async def start(self):

        buyer_offer = self.context.initial_offer

        seller_offer = self.context.target_offer



        while self.round_manager.can_continue():


            negotiation_round = self._create_round(

                buyer_offer=buyer_offer,

                seller_offer=seller_offer,

                status="pending"

            )


            evaluation = self._evaluate_round(
                negotiation_round
            )


            # Update round status based on evaluation
            negotiation_round.status = evaluation["status"]


            self.history.add_round(
                negotiation_round
            )


            if evaluation["status"] in [

                "success",

                "failed"

            ]:

                return {

                    "scenario": self.context.scenario,

                    "subject": self.context.negotiation_subject,

                    "history": self.history.get_history(),

                    "evaluation": evaluation

                }



            buyer_offer, seller_offer = (
                self._generate_next_offers(

                    buyer_offer,

                    seller_offer

                )
            )


            self.round_manager.next_round()



        return {

            "scenario": self.context.scenario,

            "subject": self.context.negotiation_subject,

            "history": self.history.get_history(),

            "evaluation": {

                "status": "failed",

                "message": "Maximum rounds completed.",

                "final_offer": None

            }

        }



    def _create_round(
        self,
        buyer_offer: float,
        seller_offer: float,
        status: str
    ):

        return self.round_manager.create_round(

            buyer_offer=buyer_offer,

            seller_counter_offer=seller_offer,

            status=status

        )



    def _evaluate_round(
        self,
        negotiation_round
    ):

        return self.evaluator.evaluate(

            negotiation_round,

            self.context.max_rounds

        )



    def _generate_next_offers(
        self,
        buyer_offer: float,
        seller_offer: float
    ):


        buyer_offer = self.strategy_manager.buyer_next_offer(

            buyer_offer,

            self.context.buyer_strategy

        )


        seller_offer = self.strategy_manager.seller_next_offer(

            seller_offer,

            self.context.seller_strategy

        )


        return buyer_offer, seller_offer