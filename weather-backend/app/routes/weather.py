from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, Dict, AsyncGenerator
from app.models import User, UserSettings
from app.schemas import WeatherOut
from app.utils import get_current_user_optional
from app.weather_service import WeatherService
from app.ai_service import AIService
from sqlalchemy.orm import Session
from app.database import get_db
from fastapi.responses import StreamingResponse
import json

router = APIRouter(prefix="/api/weather")

@router.get("/current", response_model=WeatherOut)
async def get_current_weather(
    city: str = Query(..., description="City name to query weather for"),
    units: str = Query("metric", description="Temperature unit: metric or imperial"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    try:
        if current_user:
            user_settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
            if user_settings:
                units = user_settings.temperature_unit
        
        weather = await WeatherService.get_weather(city, units)
        return weather
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/advice")
async def get_weather_advice(
    city: str = Query(..., description="City name to get advice for"),
    units: str = Query("metric", description="Temperature unit: metric or imperial"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    try:
        if current_user:
            user_settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
            if user_settings:
                units = user_settings.temperature_unit
        
        weather = await WeatherService.get_weather(city, units)
        
        if weather.forecast:
            temp_min = weather.forecast[0].temperature_min
            temp_max = weather.forecast[0].temperature_max
        else:
            temp_min = weather.current.temperature
            temp_max = weather.current.temperature
        
        advice = await AIService.get_weather_advice(
            city_name=weather.city_name,
            temperature=weather.current.temperature,
            temperature_min=temp_min,
            temperature_max=temp_max,
            weather=weather.current.weather,
            weather_description=weather.current.weather_description,
            humidity=weather.current.humidity,
            wind_speed=weather.current.wind_speed,
            wind_direction=weather.current.wind_direction
        )
        
        structured_advice = AIService._format_advice(advice)
        
        return {"city": weather.city_name, "advice": advice, "structured_advice": structured_advice}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/advice/stream")
async def get_weather_advice_stream(
    city: str = Query(..., description="City name to get advice for"),
    units: str = Query("metric", description="Temperature unit: metric or imperial"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    async def generate_stream() -> AsyncGenerator[str, None]:
        try:
            if current_user:
                user_settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
                if user_settings:
                    units = user_settings.temperature_unit
            
            weather = await WeatherService.get_weather(city, units)
            
            if weather.forecast:
                temp_min = weather.forecast[0].temperature_min
                temp_max = weather.forecast[0].temperature_max
            else:
                temp_min = weather.current.temperature
                temp_max = weather.current.temperature
            
            advice = await AIService.get_weather_advice(
                city_name=weather.city_name,
                temperature=weather.current.temperature,
                temperature_min=temp_min,
                temperature_max=temp_max,
                weather=weather.current.weather,
                weather_description=weather.current.weather_description,
                humidity=weather.current.humidity,
                wind_speed=weather.current.wind_speed,
                wind_direction=weather.current.wind_direction
            )
            
            structured_advice = AIService._format_advice(advice)
            
            yield f"data: {json.dumps(structured_advice, ensure_ascii=False)}\n\n"
            
        except Exception as e:
            yield f"error: {str(e)}\n\n"
    
    return StreamingResponse(generate_stream(), media_type="text/event-stream")

@router.get("/roleplay/characters")
async def get_roleplay_characters():
    try:
        characters = AIService.get_available_characters()
        return characters
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/roleplay")
async def get_roleplay_weather(
    city: str = Query(..., description="City name to get roleplay weather for"),
    character: str = Query("cat", description="Character ID: cat, poet, captain, horror, robot, chef"),
    custom_prompt: Optional[str] = Query(None, description="Custom character prompt for custom role"),
    units: str = Query("metric", description="Temperature unit: metric or imperial"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    try:
        if current_user:
            user_settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
            if user_settings:
                units = user_settings.temperature_unit
        
        weather = await WeatherService.get_weather(city, units)
        
        if weather.forecast:
            temp_min = weather.forecast[0].temperature_min
            temp_max = weather.forecast[0].temperature_max
        else:
            temp_min = weather.current.temperature
            temp_max = weather.current.temperature
        
        character_info = AIService.get_available_characters()
        char_info = next((c for c in character_info if c["id"] == character), None)
        
        roleplay_text = await AIService.get_roleplay_weather(
            city_name=weather.city_name,
            temperature=weather.current.temperature,
            temperature_min=temp_min,
            temperature_max=temp_max,
            weather=weather.current.weather,
            weather_description=weather.current.weather_description,
            humidity=weather.current.humidity,
            wind_speed=weather.current.wind_speed,
            wind_direction=weather.current.wind_direction,
            character_id=character,
            custom_prompt=custom_prompt
        )
        
        return {
            "city": weather.city_name,
            "character": character,
            "response": roleplay_text
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

from app.poster_service import PosterService

@router.get("/poster/styles")
async def get_poster_styles():
    try:
        styles = PosterService.get_available_styles()
        return styles
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/poster")
async def generate_weather_poster(
    city: str = Query(..., description="City name to generate poster for"),
    style: str = Query("watercolor", description="Poster style: watercolor, pixel, ukiyo-e, cyberpunk, minimalist, anime"),
    units: str = Query("metric", description="Temperature unit: metric or imperial"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    try:
        if current_user:
            user_settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
            if user_settings:
                units = user_settings.temperature_unit
        
        weather = await WeatherService.get_weather(city, units)
        
        weather_dict = {
            "city_name": weather.city_name,
            "current": {
                "weather": weather.current.weather,
                "weather_description": weather.current.weather_description,
                "temperature": weather.current.temperature
            }
        }
        
        poster_b64 = await PosterService.generate_poster(weather_dict, style)
        
        return {
            "city": weather.city_name,
            "style": style,
            "image_base64": poster_b64,
            "image_url": f"data:image/png;base64,{poster_b64}"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))