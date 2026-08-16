from fastapi import APIRouter, Depends, HTTPException

from app.schemas.negotiation import (
    NegotiationRequest,
    NegotiationResponse,
    InteractiveRoundRequest,
    InteractiveRoundResponse,
    InteractiveSaveRequest
)

from app.orchestrator.orchestrator import run_negotiation

from app.auth.dependencies import get_current_user

from app.services.negotiation_service import (
    get_all_negotiations,
    get_negotiation_by_id,
    save_negotiation
)

from app.negotiation_engine.strategy import StrategyManager
from app.services.llm_service import llm_service


router = APIRouter(
    prefix="/negotiations",
    tags=["Negotiations"]
)


# ---------------------------------------
# Start Negotiation
# ---------------------------------------

@router.post(
    "/start",
    response_model=NegotiationResponse
)
async def start_new_negotiation(
    negotiation: NegotiationRequest,
    current_user: dict = Depends(get_current_user)
):

    try:

        result = await run_negotiation(
            negotiation.model_dump()
        )


        if not result.get("success"):

            raise HTTPException(
                status_code=400,
                detail=result.get(
                    "message",
                    "Negotiation failed"
                )
            )


        return result


    except HTTPException:

        raise


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )



# ---------------------------------------
# Interactive Round
# ---------------------------------------

@router.post("/interactive-round", response_model=InteractiveRoundResponse)
async def process_interactive_round(
    req: InteractiveRoundRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        strategy_manager = StrategyManager()
        total_spread = max(abs(req.target_offer - req.initial_offer), 1.0)
        
        seller_next_offer = strategy_manager.seller_next_offer(
            current_offer=req.seller_current_offer,
            strategy=req.seller_strategy,
            total_spread=total_spread,
            min_limit=req.initial_offer,
            max_rounds=req.max_rounds
        )
        
        status = "pending"
        # Condition 1: Buyer meets or exceeds the seller's floor/target
        if req.buyer_offer >= seller_next_offer:
            status = "Accepted"
            seller_next_offer = req.buyer_offer
        # Condition 2: Max rounds reached
        elif req.round_number >= req.max_rounds:
            status = "Failed"

        seller_message = await llm_service.generate_rationale(
            role="seller",
            scenario=req.scenario,
            subject=req.subject,
            strategy=req.seller_strategy,
            current_offer=seller_next_offer,
            previous_offer=req.buyer_offer,
            is_first_round=False
        )
        
        return {
            "seller_offer": seller_next_offer,
            "seller_message": seller_message,
            "status": status
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

import traceback

# ---------------------------------------
# Save Interactive Negotiation
# ---------------------------------------

@router.post("/interactive-save")
async def save_interactive_negotiation(
    req: InteractiveSaveRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        data = {
            "scenario": req.scenario,
            "buyer_agent_id": req.buyer_agent_id,
            "seller_agent_id": req.seller_agent_id,
            "negotiation_subject": req.negotiation_subject,
            "initial_offer": req.initial_offer,
            "target_offer": req.target_offer,
            "max_rounds": req.max_rounds,
            "buyer_strategy": req.buyer_strategy,
            "seller_strategy": req.seller_strategy
        }
        
        result = {
            "final_offer": req.final_offer,
            "status": req.status,
            "message": "Interactive negotiation completed."
        }
        
        engine_result = {
            "history": req.history,
            "strategies": {
                "buyer": req.buyer_strategy,
                "seller": req.seller_strategy
            }
        }
        
        saved_result = await save_negotiation(data, result, engine_result)
        return saved_result

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# ---------------------------------------
# Get All Negotiations
# ---------------------------------------

@router.get("/")
async def get_negotiations(
    current_user: dict = Depends(get_current_user)
):

    try:

        negotiations = await get_all_negotiations()

        return {
            "success": True,
            "data": negotiations
        }


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )



# ---------------------------------------
# Get Single Negotiation
# ---------------------------------------

@router.get("/{negotiation_id}")
async def get_single_negotiation(
    negotiation_id: str,
    current_user: dict = Depends(get_current_user)
):

    try:

        negotiation = await get_negotiation_by_id(
            negotiation_id
        )


        if not negotiation:

            raise HTTPException(
                status_code=404,
                detail="Negotiation not found"
            )


        return {
            "success": True,
            "data": negotiation
        }


    except HTTPException:

        raise


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )