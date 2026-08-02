from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.services.analytics_service import get_dashboard_analytics


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/dashboard")
async def dashboard(
    current_user: dict = Depends(get_current_user)
):
    return await get_dashboard_analytics()