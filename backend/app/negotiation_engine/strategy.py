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

    def _clean_offer(self, offer: float, max_limit: Optional[float] = None, min_limit: Optional[float] = None) -> int:
        offer_int = int(round(offer))
        
        if max_limit is not None:
            offer_int = min(offer_int, int(round(max_limit)))
        if min_limit is not None:
            offer_int = max(offer_int, int(round(min_limit)))
            
        if offer_int > 1000:
            rounded = int(round(offer_int / 100.0)) * 100
            
            if max_limit is not None and rounded > max_limit:
                rounded = int(offer_int // 100) * 100
                
            if min_limit is not None and rounded < min_limit:
                rounded = int((offer_int // 100) + 1) * 100
                
            offer_int = rounded
            
        return offer_int

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
            steps = max(1, max_rounds - 1)
            base_concession = total_spread / (steps * 2)
            increment = int(round(base_concession * config["buyer_rate"]))
            increment = max(increment, 1)
        else:
            increment = int(config["fallback_buyer"])

        return self._clean_offer(current_offer + increment, max_limit=max_limit)

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
            steps = max(1, max_rounds - 1)
            base_concession = total_spread / (steps * 2)
            decrement = int(round(base_concession * config["seller_rate"]))
            decrement = max(decrement, 1)
        else:
            decrement = int(config["fallback_seller"])

        return self._clean_offer(current_offer - decrement, min_limit=min_limit)