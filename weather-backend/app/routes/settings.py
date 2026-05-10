from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserSettings
from app.schemas import UserSettingsUpdate, UserSettingsOut
from app.utils import get_current_user

router = APIRouter(prefix="/api/setting")

@router.get("/", response_model=UserSettingsOut)
def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings

@router.put("/update", response_model=UserSettingsOut)
def update_settings(
    update_data: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
    
    if update_data.temperature_unit is not None:
        if update_data.temperature_unit not in ["metric", "imperial"]:
            raise HTTPException(status_code=400, detail="Invalid temperature unit")
        settings.temperature_unit = update_data.temperature_unit
    
    if update_data.theme is not None:
        if update_data.theme not in ["light", "dark"]:
            raise HTTPException(status_code=400, detail="Invalid theme")
        settings.theme = update_data.theme
    
    db.commit()
    db.refresh(settings)
    
    return settings