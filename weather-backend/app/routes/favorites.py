from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, FavoriteCity, UserSettings
from app.schemas import FavoriteCityCreate, FavoriteCityOut, WeatherOut
from app.utils import get_current_user
from app.weather_service import WeatherService
from typing import List, Optional

router = APIRouter(prefix="/api/city")

@router.post("/add", response_model=FavoriteCityOut, status_code=status.HTTP_201_CREATED)
def add_favorite_city(
    city: FavoriteCityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(FavoriteCity).filter(
        FavoriteCity.user_id == current_user.id,
        FavoriteCity.city_name.ilike(city.city_name)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="City already in favorites"
        )
    
    new_favorite = FavoriteCity(
        user_id=current_user.id,
        city_name=city.city_name,
        city_code=city.city_code
    )
    
    db.add(new_favorite)
    db.commit()
    db.refresh(new_favorite)
    
    return new_favorite

@router.delete("/delete/{city_name}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite_city(
    city_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favorite = db.query(FavoriteCity).filter(
        FavoriteCity.user_id == current_user.id,
        FavoriteCity.city_name.ilike(city_name)
    ).first()
    
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="City not found in favorites"
        )
    
    db.delete(favorite)
    db.commit()

@router.get("/list", response_model=List[FavoriteCityOut])
def get_favorite_cities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favorites = db.query(FavoriteCity).filter(
        FavoriteCity.user_id == current_user.id
    ).order_by(FavoriteCity.created_at.desc()).all()
    
    return favorites

@router.get("/weather")
async def get_favorites_weather(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    units: Optional[str] = None
):
    try:
        user_settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
        unit = units if units else (user_settings.temperature_unit if user_settings else "metric")
        
        favorites = db.query(FavoriteCity).filter(
            FavoriteCity.user_id == current_user.id
        ).order_by(FavoriteCity.created_at.desc()).all()
        
        results = []
        for favorite in favorites:
            try:
                weather = await WeatherService.get_weather(favorite.city_name, unit)
                results.append({
                    "city_name": weather.city_name,
                    "current": weather.current.dict(),
                    "forecast": [day.dict() for day in weather.forecast[:3]] if weather.forecast else []
                })
            except Exception as e:
                results.append({
                    "city_name": favorite.city_name,
                    "error": str(e),
                    "current": None,
                    "forecast": []
                })
        
        return {"cities": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))