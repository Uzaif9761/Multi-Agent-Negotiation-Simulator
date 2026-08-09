from pydantic import BaseModel, EmailStr, Field


# ---------------------------
# Register User Schema
# ---------------------------
class UserCreate(BaseModel):

    name: str

    email: EmailStr

    password: str = Field(min_length=5)



# ---------------------------
# Login User Schema
# ---------------------------
class UserLogin(BaseModel):

    email: EmailStr

    password: str



# ---------------------------
# User Response Schema
# ---------------------------
class UserResponse(BaseModel):

    id: str

    name: str

    email: EmailStr