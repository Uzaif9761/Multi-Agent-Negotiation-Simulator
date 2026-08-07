from fastapi import APIRouter, Depends, HTTPException
from app.schemas.agent import AgentCreate
from app.services.agent_service import (
    create_agent,
    get_all_agents,
    get_agent_by_id,
    update_agent,
    delete_agent
)
from app.auth.dependencies import get_current_user


router = APIRouter(
    prefix="/agents",
    tags=["Agents"]
)


# Create Agent
@router.post("/create")
async def add_agent(
    agent: AgentCreate,
    current_user: dict = Depends(get_current_user)
):

    agent_data = {
        "name": agent.name,
        "role": agent.role,
        "goal": agent.goal,
        "strategy": agent.strategy,
        "created_by": current_user["email"]
    }

    agent_id = await create_agent(agent_data)

    return {
        "message": "Agent created successfully",
        "agent_id": agent_id
    }


# Get All Agents
@router.get("/")
async def get_agents():
    from src.agents.factory import AgentFactory
    agents = AgentFactory.get_available_agents()
    return agents


# Get Agent By ID
@router.get("/{agent_id}")
async def get_single_agent(
    agent_id: str,
    current_user: dict = Depends(get_current_user)
):

    agent = await get_agent_by_id(agent_id)

    if not agent:
        raise HTTPException(
            status_code=404,
            detail="Agent not found"
        )

    return agent


# Update Agent
@router.put("/{agent_id}")
async def update_single_agent(
    agent_id: str,
    agent: AgentCreate,
    current_user: dict = Depends(get_current_user)
):

    updated = await update_agent(
        agent_id,
        {
            "name": agent.name,
            "role": agent.role,
            "goal": agent.goal,
            "strategy": agent.strategy
        }
    )

    if updated == 0:
        raise HTTPException(
            status_code=404,
            detail="Agent not found"
        )

    return {
        "message": "Agent updated successfully"
    }


# Delete Agent
@router.delete("/{agent_id}")
async def delete_single_agent(
    agent_id: str,
    current_user: dict = Depends(get_current_user)
):

    deleted = await delete_agent(agent_id)

    if deleted == 0:
        raise HTTPException(
            status_code=404,
            detail="Agent not found"
        )

    return {
        "message": "Agent deleted successfully"
    }