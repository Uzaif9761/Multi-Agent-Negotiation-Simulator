import asyncio

from app.negotiation_engine.models import NegotiationContext
from app.negotiation_engine.engine import NegotiationEngine


async def test_engine():

    context = NegotiationContext(

        scenario="vendor_pricing",

        buyer_agent_id="buyer123",
        seller_agent_id="seller123",

        negotiation_subject="Laptop",

        initial_offer=45000,

        minimum_acceptable_offer=40000,

        target_offer=50000,

        max_rounds=5,

        buyer_strategy="Balanced",

        seller_strategy="Balanced"

    )


    engine = NegotiationEngine(context)


    result = await engine.start()


    print("\n===== ENGINE RESULT =====")

    print(result)



    # Validations
    assert result["evaluation"]["status"] == "success"
    assert result["evaluation"]["final_offer"] == 47500
    assert len(result["history"]) >= 2

    print("\nENGINE TEST PASSED")



if __name__ == "__main__":

    asyncio.run(test_engine())