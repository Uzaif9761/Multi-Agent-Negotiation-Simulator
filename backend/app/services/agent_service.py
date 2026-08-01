from bson import ObjectId
from app.database import database


async def create_agent(agent_data: dict):

    result = await database.agents.insert_one(agent_data)

    return str(result.inserted_id)


async def get_all_agents():

    agents = []

    async for agent in database.agents.find():

        agent["_id"] = str(agent["_id"])

        agents.append(agent)

    return agents


async def get_agent_by_id(agent_id: str):

    agent = await database.agents.find_one(
        {"_id": ObjectId(agent_id)}
    )

    if agent:
        agent["_id"] = str(agent["_id"])

    return agent


async def update_agent(agent_id: str, agent_data: dict):

    result = await database.agents.update_one(
        {"_id": ObjectId(agent_id)},
        {"$set": agent_data}
    )

    return result.modified_count


async def delete_agent(agent_id: str):

    result = await database.agents.delete_one(
        {"_id": ObjectId(agent_id)}
    )

    return result.deleted_count