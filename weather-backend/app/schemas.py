from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class UserCreate(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class FavoriteCityCreate(BaseModel):
    city_name: str
    city_code: Optional[str] = None

class FavoriteCityOut(BaseModel):
    id: int
    city_name: str
    city_code: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class UserSettingsUpdate(BaseModel):
    temperature_unit: Optional[str] = None
    theme: Optional[str] = None

class UserSettingsOut(BaseModel):
    temperature_unit: str
    theme: str

    class Config:
        from_attributes = True

class WeatherCurrent(BaseModel):
    temperature: float
    feels_like: float
    humidity: int
    wind_speed: float
    wind_direction: int
    weather: str
    weather_description: str
    icon: str
    sunrise: datetime
    sunset: datetime
    visibility: float
    pressure: int

class WeatherForecastDay(BaseModel):
    date: datetime
    temperature_min: float
    temperature_max: float
    weather: str
    weather_description: str
    icon: str
    humidity: int
    wind_speed: float

class WeatherOut(BaseModel):
    city_name: str
    country: str
    current: WeatherCurrent
    forecast: List[WeatherForecastDay]

class WeatherAdviceOut(BaseModel):
    advice: str