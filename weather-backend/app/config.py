from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    openweather_api_key: str
    database_url: str = "sqlite:///./weather.db"
    
    ai_api_key: str = ""
    ai_api_base_url: str = "https://api.deepseek.com"
    ai_model: str = "deepseek-chat"

    class Config:
        env_file = ".env"

settings = Settings()