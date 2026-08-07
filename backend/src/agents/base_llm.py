import os
import time
from typing import TypedDict, Annotated, Sequence
from pydantic import BaseModel, Field
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from .models import AgentConfig, AgentAction
from .tools import calculate_margin, calculate_percentage_difference
import json

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    
class CritiqueOutput(BaseModel):
    is_valid: bool = Field(description="True if the proposed action strictly obeys all constraints and makes logical sense. False otherwise.")
    feedback: str = Field(description="If false, explain exactly which constraint was violated so the agent can fix it. If true, say 'Approved'.")

class BaseLLMAgent:
    def __init__(self, config: AgentConfig):
        self.config = config
        self.history = []
        
        # We use flash-lite-latest to ensure high quota limit for these intense graph loops
        self.llm = ChatGoogleGenerativeAI(model="gemini-flash-lite-latest", temperature=0.7)
        self.tools = [calculate_margin, calculate_percentage_difference]
        
        # Bind regular tools AND the Pydantic schema as a tool for the final output
        self.llm_with_tools = self.llm.bind_tools(self.tools + [AgentAction])
        
        # The critic is a specialized LLM that outputs the CritiqueOutput schema
        self.critic_llm = self.llm.with_structured_output(CritiqueOutput)
        
        self.system_prompt = f"""You are a {self.config.agent_type} in a negotiation.
Your ID is {self.config.agent_id}.

GOAL: {self.config.goal}
CONSTRAINTS: {self.config.constraints}
PERSONALITY: {self.config.personality}

SPECIFIC NEGOTIATION PARAMETERS:
{json.dumps(self.config.extra_params, indent=2)}

CRITICAL: All prices and monetary values MUST be negotiated in Indian Rupees (₹). Format large numbers using the Indian numbering system (e.g., ₹1,00,000). Do NOT use Dollars ($).

You have access to mathematical tools to calculate margins and percentages. Use them before making an offer to ensure you meet your constraints!
When you are ready to make your final negotiation move, you MUST call the `AgentAction` tool. Do not reply with regular text, ALWAYS use the `AgentAction` tool to submit your final response.
"""
        
        # Define Elite Actor-Critic Cognitive Graph
        workflow = StateGraph(AgentState)
        
        workflow.add_node("agent", self._call_agent)
        workflow.add_node("tools", self._call_tools)
        workflow.add_node("critique", self._call_critique)
        
        workflow.set_entry_point("agent")
        
        workflow.add_conditional_edges(
            "agent",
            self._route_agent_output,
            {
                "tools": "tools",
                "approved": END
            }
        )
        
        workflow.add_edge("tools", "agent")
        
        self.app = workflow.compile()
        
    def _call_agent(self, state: AgentState):
        messages = state["messages"]
        sys_msg = SystemMessage(content=self.system_prompt)
        response = self.llm_with_tools.invoke([sys_msg] + messages)
        return {"messages": [response]}
        
    def _route_agent_output(self, state: AgentState):
        last_message = state["messages"][-1]
        
        if not last_message.tool_calls:
            # Force back to tools if it failed to output AgentAction
            return "approved" # Just end it, we'll handle gracefully in take_turn
            
        for tc in last_message.tool_calls:
            if tc["name"] == "AgentAction":
                return "approved"  # Go straight to END!
                
        return "tools" # Normal math tools
        
    def _call_tools(self, state: AgentState):
        last_message = state["messages"][-1]
        
        tool_messages = []
        for tc in last_message.tool_calls:
            if tc["name"] == "calculate_margin":
                res = calculate_margin.invoke(tc["args"])
                tool_messages.append(ToolMessage(content=str(res), tool_call_id=tc["id"], name=tc["name"]))
            elif tc["name"] == "calculate_percentage_difference":
                res = calculate_percentage_difference.invoke(tc["args"])
                tool_messages.append(ToolMessage(content=str(res), tool_call_id=tc["id"], name=tc["name"]))
                
        return {"messages": tool_messages}

    def _call_critique(self, state: AgentState):
        last_message = state["messages"][-1]
        
        # Extract the proposed action
        proposed_action = None
        tool_call_id = "unknown"
        if hasattr(last_message, "tool_calls"):
            for tc in last_message.tool_calls:
                if tc["name"] == "AgentAction":
                    proposed_action = tc["args"]
                    tool_call_id = tc["id"]
                    break
        
        if not proposed_action:
            # Agent outputted raw text instead of tool call
            feedback_msg = ToolMessage(
                content="System Error: You must output your final move using the `AgentAction` tool. Do not just type text.", 
                tool_call_id="system_error",
                name="Critic"
            )
            # If there's no tool call, LangGraph will fail to append a ToolMessage without a valid tool_call_id from the AI message.
            # We must append a HumanMessage instead for this edge case.
            return {"messages": [HumanMessage(content="System Error: You must output your final move using the `AgentAction` tool. Do not just type text.")]}

        # Ask the Critic LLM to evaluate the proposed action
        critic_prompt = f"""You are the internal compliance auditor for a {self.config.agent_type}.
Your agent is trying to make the following move:
{json.dumps(proposed_action, indent=2)}

Does this move violate these constraints?
CONSTRAINTS: {self.config.constraints}

If it violates constraints, reject it and explain why so the agent can try again.
If it is safe and logical, approve it."""

        # Invoke the structured critic
        critique: CritiqueOutput = self.critic_llm.invoke(critic_prompt)
        
        if critique.is_valid:
            # We must resolve the pending tool call to finish the graph successfully
            # We return a successful ToolMessage for the AgentAction
            return {"messages": [ToolMessage(content="Approved", tool_call_id=tool_call_id, name="AgentAction")]}
        else:
            # We reject it and provide feedback
            print(f"    [Critic]: REJECTED - {critique.feedback}")
            return {"messages": [ToolMessage(content=f"CRITIQUE REJECTED: {critique.feedback}\nFix your constraints and try again.", tool_call_id=tool_call_id, name="AgentAction")]}

    def _route_critique_output(self, state: AgentState):
        last_message = state["messages"][-1]
        # If the critic approved it, the tool message content is exactly "Approved"
        if isinstance(last_message, ToolMessage) and last_message.content == "Approved":
            return "approved"
        
        # If it was rejected, or if it was a HumanMessage error, loop back to the agent
        return "rejected"

    def load_history(self, history_data: list):
        """
        Reconstructs the agent's internal memory state from a list of plain dictionaries.
        history_data: [{"sender": "Human", "text": "Hello"}, {"sender": "AI", "text": "Hi"}]
        """
        self.history = []
        for msg in history_data:
            if msg["sender"] == "Human":
                self.history.append(HumanMessage(content=msg["text"]))
            elif msg["sender"] == "AI":
                self.history.append(AIMessage(content=msg["text"]))
                
    def take_turn(self, context_message: str) -> AgentAction:
        """
        Takes a turn in the negotiation using the internal LangGraph thought loop.
        """
        self.history.append(HumanMessage(content=context_message))
        
        result = self.app.invoke({"messages": self.history})
        final_msgs = result["messages"]
        
        # Since we bypassed the Critic, the final message IS the AI message containing the tool call
        agent_msg = final_msgs[-1]
        action_payload = None
        
        if hasattr(agent_msg, "tool_calls"):
            for tc in agent_msg.tool_calls:
                if tc["name"] == "AgentAction":
                    action_payload = tc["args"]
                    break
                    
        if action_payload is None:
            action_payload = {
                "action_type": "OFFER",
                "value": 0.0,
                "message": "Error: Failed to generate valid action.",
                "reasoning": "Graph failed to parse final action."
            }
            
        action = AgentAction(**action_payload)
        self.history.append(AIMessage(content=action.message))
        
        return action
