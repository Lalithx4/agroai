"""
Pydantic models for API request/response validation
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class Language(str, Enum):
    ENGLISH = "en"
    HINDI = "hi"
    TELUGU = "te"

# ============ Health Analysis ============

class HealthAnalysisRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded plant image")
    plant_type: Optional[str] = Field(None, description="Type of plant if known")
    language: Language = Field(Language.ENGLISH, description="Response language")

class Disease(BaseModel):
    name: str
    confidence: float = Field(..., ge=0, le=100)
    severity: str = Field(..., description="low, medium, high, critical")
    description: str

class HealthAnalysisResponse(BaseModel):
    plant_type: str
    health_status: str = Field(..., description="healthy, mild, moderate, severe")
    diseases: List[Disease]
    recommendations: List[str]
    confidence: float
    summary: str

# ============ Plant Chat ============

class ChatMessage(BaseModel):
    role: str = Field(..., description="user or assistant")
    content: str

class PlantChatRequest(BaseModel):
    message: str = Field(..., description="User message to the plant")
    plant_type: str = Field(..., description="Type of plant")
    health_status: str = Field(..., description="Current health status")
    diseases: List[str] = Field(default=[], description="List of detected diseases")
    conversation_history: List[ChatMessage] = Field(default=[], description="Previous messages")
    language: Language = Field(Language.ENGLISH, description="Response language")

class PlantChatResponse(BaseModel):
    response: str
    emotion: str = Field(..., description="happy, sad, worried, grateful, grumpy")
    tip: Optional[str] = None

# ============ Future Generation ============

class FutureGenerationRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded plant image")
    scenario: str = Field(..., description="treated or untreated")
    disease: str = Field(..., description="The disease to show progression for")
    days_ahead: int = Field(default=14, description="Days into future")
    language: Language = Field(Language.ENGLISH, description="Response language")

class FutureGenerationResponse(BaseModel):
    original_image: str
    future_image: str
    description: str
    probability: float

# ============ Soil & Weather ============

class SoilWeatherRequest(BaseModel):
    image_base64: Optional[str] = Field(None, description="Base64 encoded soil image")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    language: Language = Field(Language.ENGLISH, description="Response language")

class SoilAnalysis(BaseModel):
    soil_type: str
    texture: str
    moisture_level: str
    ph_estimate: str
    organic_matter: str
    recommendations: List[str]

class WeatherData(BaseModel):
    temperature: float
    humidity: float
    description: str
    wind_speed: float
    rain_probability: float
    forecast: List[dict]

class SoilWeatherResponse(BaseModel):
    soil: Optional[SoilAnalysis]
    weather: WeatherData
    farming_advice: List[str]
    alerts: List[str]

# ============ Generic ============

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    code: str

class SuccessResponse(BaseModel):
    success: bool = True
    message: str
