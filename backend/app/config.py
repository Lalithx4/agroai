"""
CropMagix Configuration
Production-ready environment configuration
"""

import os
from pathlib import Path
from functools import lru_cache
from typing import Optional
from dotenv import load_dotenv

# Load .env file from backend directory
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

class Settings:
    """Application settings loaded from environment variables"""
    
    # API Keys
    CEREBRAS_API_KEY: str = os.getenv("CEREBRAS_API_KEY", "")
    GOOGLE_AI_API_KEY: str = os.getenv("GOOGLE_AI_API_KEY", "")
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    HUGGINGFACE_API_KEY: str = os.getenv("HUGGINGFACE_API_KEY", "")
    
    # Server Configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # CORS - Allow Vercel frontend
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "https://*.vercel.app",
        "*"  # For development - restrict in production
    ]
    
    # Model Configuration
    CEREBRAS_MODEL: str = "llama-3.3-70b"
    GEMINI_MODEL: str = "gemini-2.0-flash"
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD: int = 3600  # 1 hour
    
    # Supported Languages
    SUPPORTED_LANGUAGES: list = ["en", "hi", "te"]
    DEFAULT_LANGUAGE: str = "en"

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

settings = get_settings()
