import asyncio
import sys
import os

# Add backend directory to sys.path so app modules are importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.negotiation_engine.models import NegotiationContext
from app.negotiation_engine.engine import NegotiationEngine
from app.negotiation_engine.strategy import StrategyManager
from app.negotiation_engine.evaluator import NegotiationEvaluator
from app.negotiation_engine.round_manager import RoundManager


async def test_vendor_pricing_balanced_convergence():
    print("\n--- Test 1: Vendor Pricing (Balanced vs Balanced) ---")
    context = NegotiationContext(
        scenario="vendor_pricing",
        buyer_agent_id="buyer_001",
        seller_agent_id="seller_001",
        negotiation_subject="Enterprise Server",
        initial_offer=45000.0,
        minimum_acceptable_offer=40000.0,
        target_offer=50000.0,
        max_rounds=5,
        buyer_strategy="Balanced",
        seller_strategy="Balanced"
    )
    engine = NegotiationEngine(context)
    result = await engine.start()
    
    assert result["evaluation"]["status"] == "success", f"Expected success, got {result['evaluation']['status']}"
    assert result["evaluation"]["final_offer"] is not None
    assert 40000.0 <= result["evaluation"]["final_offer"] <= 50000.0
    assert len(result["history"]) >= 1
    print(f"PASSED: Agreement in Round {len(result['history'])}, Final Settlement: {result['evaluation']['final_offer']}")


async def test_aggressive_vs_aggressive():
    print("\n--- Test 2: Aggressive vs Aggressive (Tough Concessions) ---")
    context = NegotiationContext(
        scenario="vendor_pricing",
        buyer_agent_id="buyer_002",
        seller_agent_id="seller_002",
        negotiation_subject="Industrial Equipment",
        initial_offer=80000.0,
        minimum_acceptable_offer=75000.0,
        target_offer=100000.0,
        max_rounds=6,
        buyer_strategy="Aggressive",
        seller_strategy="Aggressive"
    )
    engine = NegotiationEngine(context)
    result = await engine.start()
    
    assert len(result["history"]) > 1
    print(f"PASSED: Completed {len(result['history'])} rounds. Status: {result['evaluation']['status']}")


async def test_small_scale_hourly_wage():
    print("\n--- Test 3: Small Scale Monetary Negotiation (Hourly Wage) ---")
    context = NegotiationContext(
        scenario="job_offer",
        buyer_agent_id="candidate_003",
        seller_agent_id="hr_003",
        negotiation_subject="Hourly Consulting Rate",
        initial_offer=35.0,
        minimum_acceptable_offer=30.0,
        target_offer=50.0,
        max_rounds=5,
        buyer_strategy="Balanced",
        seller_strategy="Balanced"
    )
    engine = NegotiationEngine(context)
    result = await engine.start()
    
    assert result["evaluation"]["status"] == "success"
    final_offer = result["evaluation"]["final_offer"]
    assert 30.0 <= final_offer <= 50.0
    print(f"PASSED: Small scale negotiation reached agreement at ${final_offer}/hr in {len(result['history'])} rounds.")


async def test_large_scale_enterprise_budget():
    print("\n--- Test 4: Large Scale Monetary Negotiation ($1,000,000) ---")
    context = NegotiationContext(
        scenario="budget_allocation",
        buyer_agent_id="dept_lead",
        seller_agent_id="cfo",
        negotiation_subject="AI Infrastructure Budget",
        initial_offer=600000.0,
        minimum_acceptable_offer=500000.0,
        target_offer=1000000.0,
        max_rounds=5,
        buyer_strategy="Balanced",
        seller_strategy="Conservative"
    )
    engine = NegotiationEngine(context)
    result = await engine.start()
    
    assert result["evaluation"]["status"] == "success"
    final_offer = result["evaluation"]["final_offer"]
    assert 500000.0 <= final_offer <= 1000000.0
    print(f"PASSED: Large scale negotiation reached agreement at ${final_offer:,.2f} in {len(result['history'])} rounds.")


async def test_max_rounds_termination():
    print("\n--- Test 5: Reaching Max Rounds with Deadlock ---")
    context = NegotiationContext(
        scenario="vendor_pricing",
        buyer_agent_id="buyer_rigid",
        seller_agent_id="seller_rigid",
        negotiation_subject="Rare Vintage Commodity",
        initial_offer=10000.0,
        minimum_acceptable_offer=90000.0,
        target_offer=100000.0,
        max_rounds=3,
        buyer_strategy="Aggressive",
        seller_strategy="Aggressive"
    )
    engine = NegotiationEngine(context)
    result = await engine.start()
    
    assert result["evaluation"]["status"] == "failed"
    assert "Maximum negotiation rounds" in result["evaluation"]["message"]
    assert len(result["history"]) == 3
    print(f"PASSED: Correctly terminated after {len(result['history'])} rounds with status: failed.")


async def run_all_tests():
    print("==================================================")
    print("RUNNING MEMBER 5 ORCHESTRATOR & ENGINE TEST SUITE")
    print("==================================================")
    await test_vendor_pricing_balanced_convergence()
    await test_aggressive_vs_aggressive()
    await test_small_scale_hourly_wage()
    await test_large_scale_enterprise_budget()
    await test_max_rounds_termination()
    print("\n==================================================")
    print("ALL 5 NEGOTIATION ENGINE TEST SUITES PASSED! [SUCCESS]")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(run_all_tests())
