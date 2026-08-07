from pydantic import BaseModel


class AgentCreate(BaseModel):
    name: str
    role: str
    goal: str
    strategy: str


class AgentResponse(BaseModel):
    id: str
    name: str
    role: str
    goal: str
    strategy: str