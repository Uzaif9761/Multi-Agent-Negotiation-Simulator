from app.negotiation_engine.models import NegotiationContext
from app.negotiation_engine.round_manager import RoundManager
from app.negotiation_engine.strategy import StrategyManager
from app.negotiation_engine.evaluator import NegotiationEvaluator
from app.negotiation_engine.history import NegotiationHistory
from app.services.llm_service import llm_service
import asyncio


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



        previous_seller_offer = None

        while self.round_manager.can_continue():

            is_first_round = (self.round_manager.current_round == 1)
            
            buyer_task = llm_service.generate_rationale(
                role="buyer",
                scenario=self.context.scenario,
                subject=self.context.negotiation_subject,
                strategy=self.context.buyer_strategy,
                current_offer=buyer_offer,
                previous_offer=previous_seller_offer,
                is_first_round=is_first_round
            )
            
            seller_task = llm_service.generate_rationale(
                role="seller",
                scenario=self.context.scenario,
                subject=self.context.negotiation_subject,
                strategy=self.context.seller_strategy,
                current_offer=seller_offer,
                previous_offer=buyer_offer,
                is_first_round=False
            )

            buyer_message, seller_message = await asyncio.gather(buyer_task, seller_task)


            negotiation_round = self._create_round(

                buyer_offer=buyer_offer,

                seller_offer=seller_offer,
                
                buyer_message=buyer_message,
                
                seller_message=seller_message,

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



            previous_seller_offer = seller_offer

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
        buyer_message: str,
        seller_message: str,
        status: str
    ):

        return self.round_manager.create_round(

            buyer_offer=buyer_offer,

            seller_counter_offer=seller_offer,
            
            buyer_message=buyer_message,
            
            seller_message=seller_message,

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
        total_spread = max(
            abs(self.context.target_offer - self.context.initial_offer),
            1.0
        )

        buyer_offer = self.strategy_manager.buyer_next_offer(
            current_offer=buyer_offer,
            strategy=self.context.buyer_strategy,
            total_spread=total_spread,
            max_limit=self.context.target_offer,
            max_rounds=self.context.max_rounds
        )

        seller_offer = self.strategy_manager.seller_next_offer(
            current_offer=seller_offer,
            strategy=self.context.seller_strategy,
            total_spread=total_spread,
            min_limit=self.context.initial_offer,
            max_rounds=self.context.max_rounds
        )

        return buyer_offer, seller_offer