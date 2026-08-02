from datetime import datetime
from bson import ObjectId

from app.database import database
from app.services.agent_service import get_agent_by_id



async def save_negotiation(
    data: dict,
    result: dict,
    engine_result: dict
):

    buyer = await get_agent_by_id(
        data["buyer_agent_id"]
    )

    seller = await get_agent_by_id(
        data["seller_agent_id"]
    )


    if not buyer:

        return {
            "success": False,
            "message": "Buyer agent not found"
        }


    if not seller:

        return {
            "success": False,
            "message": "Seller agent not found"
        }



    # ---------------------------------------
    # Convert Negotiation History
    # Pydantic Model -> MongoDB Document
    # ---------------------------------------

    history = []


    for round_data in engine_result.get(
        "history",
        []
    ):

        history.append(
            round_data.model_dump()
        )



    negotiation = {

        "scenario": data["scenario"],

        "buyer_agent_id": data["buyer_agent_id"],

        "seller_agent_id": data["seller_agent_id"],

        "product": data.get(
            "negotiation_subject",
            data.get("product")
        ),

        "initial_offer": data["initial_offer"],

        "final_offer": result["final_offer"],

        "status": result["status"],

        "message": result["message"],


        # New fields
        "history": history,

        "strategies": {

            "buyer": data.get(
                "buyer_strategy",
                "Balanced"
            ),

            "seller": data.get(
                "seller_strategy",
                "Balanced"
            )

        },


        "created_at": datetime.utcnow(),

        "completed_at": datetime.utcnow()

    }



    db_result = await database.negotiations.insert_one(
        negotiation
    )



    return {

        "success": True,

        "negotiation_id": str(
            db_result.inserted_id
        ),

        "status": result["status"],

        "final_offer": result["final_offer"],

        "message": result["message"],

        "history": history,

        "strategies": {

            "buyer": data.get(
                "buyer_strategy",
                "Balanced"
            ),

            "seller": data.get(
                "seller_strategy",
                "Balanced"
            )

        }

    }




# ---------------------------------------
# Get All Negotiations
# ---------------------------------------

async def get_all_negotiations():

    negotiations = []


    async for negotiation in database.negotiations.find().sort(
    "created_at",
    -1
):

        negotiation["_id"] = str(
            negotiation["_id"]
        )

        negotiations.append(
            negotiation
        )


    return negotiations




# ---------------------------------------
# Get Single Negotiation
# ---------------------------------------

async def get_negotiation_by_id(
    negotiation_id: str
):

    try:

        negotiation = await database.negotiations.find_one(
        {
            "_id": ObjectId(negotiation_id)
        }
    )

    except Exception:

        return None


    if negotiation:

        negotiation["_id"] = str(
            negotiation["_id"]
        )

        return negotiation


    return None