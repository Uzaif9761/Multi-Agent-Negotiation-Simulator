import asyncio

from app.orchestrator.orchestrator import run_negotiation


async def test_orchestrator():

    data = {

        "scenario": "vendor_pricing",

        "buyer_agent_id": "6a68aa34b06bb460f7da4b31",

        "seller_agent_id": "6a6a40553c0a8333a2b56b72",

        "negotiation_subject": "Laptop",

        "initial_offer": 45000,

        "minimum_acceptable_offer": 40000,

        "target_offer": 50000,

        "max_rounds": 5,

        "buyer_strategy": "Balanced",

        "seller_strategy": "Balanced"

    }


    result = await run_negotiation(data)


    print("\n===== ORCHESTRATOR RESULT =====")

    print(result)



    assert result["success"] is True

    assert "negotiation_id" in result

    assert "status" in result

    assert "final_offer" in result



    print("\nORCHESTRATOR TEST PASSED")



if __name__ == "__main__":

    asyncio.run(test_orchestrator())