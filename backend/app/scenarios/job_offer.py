async def job_offer_negotiation(data: dict):

    candidate_offer = data["initial_offer"]
    target_salary = data["target_offer"]
    minimum_salary = data["minimum_acceptable_offer"]

    # Company accepts immediately
    if candidate_offer >= target_salary:

        return {
            "success": True,
            "status": "Accepted",
            "final_offer": candidate_offer,
            "message": "Company accepted the candidate's salary expectation."
        }

    # Candidate's expectation is too low
    if candidate_offer < minimum_salary:

        return {
            "success": True,
            "status": "Rejected",
            "final_offer": minimum_salary,
            "message": "Salary expectation is below the company's minimum offer."
        }

    # Negotiate towards the target salary
    counter_offer = (candidate_offer + target_salary) / 2

    return {
        "success": True,
        "status": "Counter Offer",
        "final_offer": round(counter_offer, 2),
        "message": "Company proposed a revised salary offer."
    }