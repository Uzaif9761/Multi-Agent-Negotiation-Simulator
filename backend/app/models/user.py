from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional


class User(BaseModel):
    name: str
    email: EmailStr
    password: str
    created_at: Optional[datetime] = datetime.utcnow()