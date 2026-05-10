from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, FavoriteCity
from app.schemas import FavoriteCityCreate, FavoriteCityOut
from app.utils import get_current_user
from typing import List

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