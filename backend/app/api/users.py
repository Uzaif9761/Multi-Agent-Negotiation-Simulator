from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.database import database
from app.schemas.user import UserCreate, UserLogin
from app.utils.password import hash_password, verify_password
from app.auth.jwt import create_access_token
from app.auth.dependencies import get_current_user


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# ---------------------------
# Register User
# ---------------------------
@router.post("/register")
async def register_user(user: UserCreate):

    existing_user = await database.users.find_one(
        {"email": user.email}
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = hash_password(user.password)

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password
    }

    result = await database.users.insert_one(new_user)

    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id)
    }


# ---------------------------
# Login User
# ---------------------------
@router.post("/login")
async def login_user(
    user: UserLogin
):

    existing_user = await database.users.find_one(
        {
            "email": user.email
        }
    )


    if not existing_user:

        raise HTTPException(
            status_code=400,
            detail="Invalid email or password"
        )


    if not verify_password(
        user.password,
        existing_user["password"]
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid email or password"
        )


    access_token = create_access_token(
        {
            "user_id": str(existing_user["_id"]),
            "email": existing_user["email"]
        }
    )


    return {

        "access_token": access_token,

        "token_type": "bearer"

    }

# ---------------------------
# Swagger OAuth2 Login
# ---------------------------
@router.post("/token")
async def login_for_swagger(
    form_data: OAuth2PasswordRequestForm = Depends()
):

    existing_user = await database.users.find_one(
        {
            "email": form_data.username
        }
    )


    if not existing_user:

        raise HTTPException(
            status_code=400,
            detail="Invalid email or password"
        )


    if not verify_password(
        form_data.password,
        existing_user["password"]
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid email or password"
        )


    access_token = create_access_token(
        {
            "user_id": str(existing_user["_id"]),
            "email": existing_user["email"]
        }
    )


    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

# ---------------------------
# Protected Profile
# ---------------------------
@router.get("/profile")
async def get_profile(
    current_user: dict = Depends(get_current_user)
):

    return {
        "message": "Profile accessed successfully",
        "user": current_user
    }