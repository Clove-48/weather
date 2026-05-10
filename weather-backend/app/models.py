from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    favorites = relationship("FavoriteCity", back_populates="user")
    settings = relationship("UserSettings", back_populates="user", uselist=False)

class FavoriteCity(Base):
    __tablename__ = "favorite_cities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    city_name = Column(String, nullable=False)
    city_code = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="favorites")

class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    temperature_unit = Column(Enum("metric", "imperial"), default="metric")
    theme = Column(Enum("light", "dark"), default="light")
    
    user = relationship("User", back_populates="settings")