from app.negotiation_engine.models import NegotiationContext
from app.negotiation_engine.engine import NegotiationEngine

from app.scenarios.job_offer import job_offer_negotiation
from app.scenarios.budget_allocation import budget_allocation_negotiation
from app.scenarios.vendor_pricing import vendor_pricing_negotiation

from app.services.negotiation_service import save_negotiation


SCENARIO_HANDLERS = {

    "job_offer": job_offer_negotiation,

    "budget_allocation": budget_allocation_negotiation,

    "vendor_pricing": vendor_pricing_negotiation

}



async def run_negotiation(data: dict):

    scenario = data.get("scenario")


    negotiation_handler = SCENARIO_HANDLERS.get(
        scenario
    )


    if not negotiation_handler:

        return {
            "success": False,
            "message": "Invalid negotiation scenario."
        }



    # Run scenario business rule first
    scenario_result = await negotiation_handler(
        data
    )


    # Direct decision scenarios
    if scenario == "budget_allocation" and scenario_result["status"] in [
        "Approved",
        "Rejected"
    ]:

        saved_result = await save_negotiation(
            data,
            scenario_result,
            {
                "history": [],
                "strategies": {
                    "buyer": data.get("buyer_strategy", "Balanced"),
                    "seller": data.get("seller_strategy", "Balanced")
                }
            }
        )

        return saved_result



    context = NegotiationContext(

        scenario=data["scenario"],

        buyer_agent_id=data["buyer_agent_id"],

        seller_agent_id=data["seller_agent_id"],

        negotiation_subject=data["negotiation_subject"],

        initial_offer=data["initial_offer"],

        target_offer=data["target_offer"],

        max_rounds=data.get(
            "max_rounds",
            5
        ),

        buyer_strategy=data.get(
            "buyer_strategy",
            "Balanced"
        ),

        seller_strategy=data.get(
            "seller_strategy",
            "Balanced"
        )

    )



    engine = NegotiationEngine(
        context
    )


    engine_result = await engine.start()


    evaluation = engine_result["evaluation"]


    final_result = {

        "success": True,

        "status": evaluation["status"],

        "final_offer": evaluation["final_offer"],

        "message": evaluation["message"]

    }



    saved_result = await save_negotiation(

        data,

        final_result,

        engine_result

    )


    return saved_result