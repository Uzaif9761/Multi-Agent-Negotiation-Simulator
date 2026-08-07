import pytest
from unittest.mock import patch, MagicMock
from backend.src.agents.models import ActionType, AgentAction
from backend.src.agents.factory import AgentFactory
from backend.src.agents.tools import calculate_margin, calculate_percentage_difference

@pytest.fixture
def mock_llm():
    with patch('backend.src.agents.base_llm.ChatGoogleGenerativeAI') as MockLLM:
        yield MockLLM

def test_agent_factory_loads_yaml(mock_llm):
    agent = AgentFactory.create_agent("buyer", "b1")
    assert agent.config.agent_type == "Buyer"
    assert "lowest possible price" in agent.config.goal

    agent = AgentFactory.create_agent("hr", "hr1")
    assert agent.config.agent_type == "HR Representative"
    
def test_agent_factory_invalid_type(mock_llm):
    with pytest.raises(ValueError):
        AgentFactory.create_agent("unknown_role", "x1")

def test_calculator_tools():
    margin = calculate_margin.invoke({"sale_price": 100, "cost": 80})
    assert margin == "20.00%"
    
    diff = calculate_percentage_difference.invoke({"value1": 50, "value2": 60})
    assert diff == "20.00%"

@patch('backend.src.agents.base_llm.ChatGoogleGenerativeAI')
def test_agent_take_turn(mock_llm):
    agent = AgentFactory.create_agent("hr", "hr1")
    
    # Mock the internal langgraph app
    mock_app = MagicMock()
    
    # Create a mock AI message with the tool call
    mock_ai_msg = MagicMock()
    mock_ai_msg.tool_calls = [{
        "name": "AgentAction",
        "args": {
            "action_type": "COUNTER_OFFER",
            "value": 50000.0,
            "message": "I can offer 50k.",
            "reasoning": "Testing the candidate."
        }
    }]
    
    # Create a mock tool message (approved)
    mock_tool_msg = MagicMock()
    mock_tool_msg.content = "Approved"
    
    # The new graph expects the final AI message at -2 and the ToolMessage at -1
    mock_app.invoke.return_value = {"messages": [mock_ai_msg, mock_tool_msg]}
    agent.app = mock_app
    
    action = agent.take_turn("I want 60k.")
    
    assert action.action_type == ActionType.COUNTER_OFFER
    assert action.value == 50000.0
    assert action.message == "I can offer 50k."
    assert "I want 60k." in agent.history[0].content
