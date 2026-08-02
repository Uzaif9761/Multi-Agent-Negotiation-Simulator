from app.database import database


async def get_dashboard_analytics():

    total = await database.negotiations.count_documents({})

    success = await database.negotiations.count_documents({
        "status": "success"
    })

    failed = await database.negotiations.count_documents({
        "status": "failed"
    })

    approved = await database.negotiations.count_documents({
        "status": "Approved"
    })

    counter_offer = await database.negotiations.count_documents({
        "status": "Counter Offer"
    })

    job_offer = await database.negotiations.count_documents({
        "scenario": "job_offer"
    })

    budget_allocation = await database.negotiations.count_documents({
        "scenario": "budget_allocation"
    })

    vendor_pricing = await database.negotiations.count_documents({
        "scenario": "vendor_pricing"
    })

    return {
        "total_negotiations": total,
        "accepted": success + approved,
        "counter_offers": counter_offer,
        "rejected": failed,
        "job_offer": job_offer,
        "budget_allocation": budget_allocation,
        "vendor_pricing": vendor_pricing
    }