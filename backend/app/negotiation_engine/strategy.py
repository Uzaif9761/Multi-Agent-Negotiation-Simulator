from typing import Optional


class StrategyManager:

    # Concession rate fractions relative to the initial negotiation spread
    CONCESSION_RATES = {
        "Aggressive": {
            "buyer_rate": 0.5,
            "seller_rate": 0.5,
            "fallback_buyer": 4000.0,
            "fallback_seller": 1000.0
        },
        "Balanced": {
            "buyer_rate": 1.0,
            "seller_rate": 1.0,
            "fallback_buyer": 2500.0,
            "fallback_seller": 2500.0
        },
        "Conservative": {
            "buyer_rate": 1.5,
            "seller_rate": 1.5,
            "fallback_buyer": 1000.0,
            "fallback_seller": 4000.0
        }
    }

    # Aliases for strategy names across agents/scenarios
    STRATEGY_ALIASES = {
        "competitive": "Aggressive",
        "aggressive": "Aggressive",
        "balanced": "Balanced",
        "collaborative": "Balanced",
        "neutral": "Balanced",
        "conservative": "Conservative",
        "accommodating": "Conservative"
    }

    def _normalize_strategy(self, strategy: str) -> str:
        if not strategy:
            return "Balanced"
        return self.STRATEGY_ALIASES.get(strategy.strip().lower(), "Balanced")

    def buyer_next_offer(
        self,
        current_offer: float,
        strategy: str,
        total_spread: Optional[float] = None,
        max_limit: Optional[float] = None,
        max_rounds: int = 5
    ) -> float:
        norm_strategy = self._normalize_strategy(strategy)
        config = self.CONCESSION_RATES[norm_strategy]

        if total_spread is not None and total_spread > 0:
            base_concession = total_spread / (max_rounds * 2)
            increment = round(base_concession * config["buyer_rate"], 2)
            increment = max(increment, 1.0)
        else:
            increment = config["fallback_buyer"]

        next_offer = round(current_offer + increment, 2)
        if max_limit is not None:
            next_offer = min(next_offer, max_limit)

        return next_offer

    def seller_next_offer(
        self,
        current_offer: float,
        strategy: str,
        total_spread: Optional[float] = None,
        min_limit: Optional[float] = None,
        max_rounds: int = 5
    ) -> float:
        norm_strategy = self._normalize_strategy(strategy)
        config = self.CONCESSION_RATES[norm_strategy]

        if total_spread is not None and total_spread > 0:
            base_concession = total_spread / (max_rounds * 2)
            decrement = round(base_concession * config["seller_rate"], 2)
            decrement = max(decrement, 1.0)
        else:
            decrement = config["fallback_seller"]

        next_offer = round(current_offer - decrement, 2)
        if min_limit is not None:
            next_offer = max(next_offer, min_limit)

        return next_offer