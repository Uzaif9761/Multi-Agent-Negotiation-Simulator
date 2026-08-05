from fastapi import APIRouter, Depends, HTTPException

from app.schemas.negotiation import (
    NegotiationRequest,
    NegotiationResponse
)

from app.orchestrator.orchestrator import run_negotiation

from app.auth.dependencies import get_current_user

from app.services.negotiation_service import (
    get_all_negotiations,
    get_negotiation_by_id
)


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