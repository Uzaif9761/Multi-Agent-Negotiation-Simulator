async def budget_allocation_negotiation(data: dict):

    requested_budget = float(
        data["initial_offer"]
    )

    available_budget = float(
        data["target_offer"]
    )


    # Budget is within available limit
    if requested_budget <= available_budget:

        return {
            "success": True,
            "status": "Approved",
            "final_offer": requested_budget,
            "message": "Requested budget has been approved."
        }


    # Budget exceeds maximum acceptable limit
    if requested_budget > (available_budget * 1.25):

        return {
            "success": True,
            "status": "Rejected",
            "final_offer": available_budget,
            "message": "Requested budget exceeds the maximum allocatable limit."
        }


    # Counter allocation
    counter_offer = (
        requested_budget + available_budget
    ) / 2


    return {
        "success": True,
        "status": "Counter Offer",
        "final_offer": round(counter_offer, 2),
        "message": "A revised budget allocation has been proposed."
    }