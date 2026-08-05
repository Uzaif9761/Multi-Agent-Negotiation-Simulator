from pydantic import BaseModel, EmailStr


# ---------------------------
# Register User Schema
# ---------------------------
class UserCreate(BaseModel):

    name: str

    email: EmailStr

    password: str



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