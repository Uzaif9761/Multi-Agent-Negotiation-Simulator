from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

from app.config.settings import settings


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/users/token"
)


async def get_current_user(
    token: str = Depends(oauth2_scheme)
):

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        user_id = payload.get("user_id")
        email = payload.get("email")

        if user_id is None or email is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        return {
            "user_id": user_id,
            "email": email
        }

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )