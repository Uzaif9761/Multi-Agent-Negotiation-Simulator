class StrategyManager:

    def __init__(self):

        self.strategy_config = {
            "Aggressive": {
                "buyer_increment": 4000,
                "seller_decrement": 1000
            },
            "Balanced": {
                "buyer_increment": 2500,
                "seller_decrement": 2500
            },
            "Conservative": {
                "buyer_increment": 1000,
                "seller_decrement": 4000
            }
        }

    def buyer_next_offer(
        self,
        current_offer: float,
        strategy: str
    ) -> float:

        config = self.strategy_config.get(
            strategy,
            self.strategy_config["Balanced"]
        )

        return current_offer + config["buyer_increment"]

    def seller_next_offer(
        self,
        current_offer: float,
        strategy: str
    ) -> float:

        config = self.strategy_config.get(
            strategy,
            self.strategy_config["Balanced"]
        )

        return current_offer - config["seller_decrement"]