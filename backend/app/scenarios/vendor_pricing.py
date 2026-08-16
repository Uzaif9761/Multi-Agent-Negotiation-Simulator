async def vendor_pricing_negotiation(data: dict):

    buyer_offer = float(data["initial_offer"])
    target_offer = float(data["target_offer"])
    minimum_offer = float(data["initial_offer"])

    # Vendor's negotiation window (20% of the gap)
    negotiation_margin = (target_offer - minimum_offer) * 0.20
    acceptable_price = target_offer - negotiation_margin

    # Buyer meets or exceeds target
    if buyer_offer >= target_offer:

        return {
            "success": True,
            "status": "Accepted",
            "final_offer": buyer_offer,
            "message": "Vendor accepted the buyer's offer."
        }

    # Buyer is within acceptable negotiation range
    if buyer_offer >= acceptable_price:

        return {
            "success": True,
            "status": "Accepted",
            "final_offer": buyer_offer,
            "message": "Vendor accepted the negotiated offer."
        }

    # Buyer is below minimum price
    if buyer_offer < minimum_offer:

        return {
            "success": True,
            "status": "Rejected",
            "final_offer": minimum_offer,
            "message": "Offer is below the vendor's minimum acceptable price."
        }

    # Vendor proposes a counter offer
    counter_offer = round((buyer_offer + target_offer) / 2, 2)

    return {
        "success": True,
        "status": "Counter Offer",
        "final_offer": counter_offer,
        "message": "Vendor proposed a counter offer."
    }