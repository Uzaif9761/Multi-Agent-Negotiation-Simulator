-- Seed scenarios for development and testing.

INSERT INTO scenarios (name, description, config, created_by)
VALUES
    (
        'Retail Supplier Negotiation',
        'A baseline retail procurement scenario with a buyer and a supplier.',
        '{"agent_types": ["competitive", "collaborative"], "max_rounds": 8, "starting_budget": 100000, "enable_counter_offers": true, "negotiation_mode": "turn_based", "metadata": {"domain": "procurement"}}',
        NULL
    ),
    (
        'Salary Negotiation',
        'A job offer scenario focused on compensation and benefits.',
        '{"agent_types": ["collaborative", "neutral"], "max_rounds": 6, "starting_budget": 150000, "enable_counter_offers": true, "negotiation_mode": "turn_based", "metadata": {"domain": "hiring"}}',
        NULL
    );
