from langchain_core.tools import tool

@tool
def calculate_margin(sale_price: float, cost: float) -> str:
    """
    Calculates the profit margin percentage given the sale_price and cost.
    Use this to ensure a deal meets your minimum acceptable margin.
    """
    if sale_price <= 0:
        return "Error: sale_price must be greater than 0"
    margin = ((sale_price - cost) / sale_price) * 100
    return f"{margin:.2f}%"

@tool
def calculate_percentage_difference(value1: float, value2: float) -> str:
    """
    Calculates the percentage difference between two values.
    Use this to compare offers and counter-offers.
    """
    if value1 == 0:
        return "Error: value1 cannot be 0"
    diff = ((value2 - value1) / abs(value1)) * 100
    return f"{diff:.2f}%"
