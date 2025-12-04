"""
Soil & Weather Router
Endpoint for soil analysis and weather-based recommendations
"""

from fastapi import APIRouter, HTTPException
from typing import Optional
from ..models.schemas import (
    SoilWeatherRequest, 
    SoilWeatherResponse, 
    SoilAnalysis, 
    WeatherData
)
from ..services.gemini_service import gemini_service
from ..services.weather_service import weather_service

router = APIRouter(prefix="/api", tags=["Soil & Weather"])

@router.post("/soil-weather", response_model=SoilWeatherResponse)
async def analyze_soil_and_weather(request: SoilWeatherRequest):
    """
    Analyze soil from image and combine with weather data
    
    - Uses Gemini Vision for soil texture/type analysis
    - Fetches real-time weather from OpenWeatherMap
    - Provides hyper-local farming recommendations
    - Supports multiple languages (en, hi, te)
    """
    
    try:
        soil_analysis = None
        
        # Analyze soil if image provided
        if request.image_base64:
            image_data = request.image_base64
            if "," in image_data:
                image_data = image_data.split(",")[1]
            
            soil_result = await gemini_service.analyze_soil(
                image_base64=image_data,
                language=request.language.value
            )
            
            soil_analysis = SoilAnalysis(
                soil_type=soil_result.get("soil_type", "unknown"),
                texture=soil_result.get("texture", "unknown"),
                moisture_level=soil_result.get("moisture_level", "unknown"),
                ph_estimate=soil_result.get("ph_estimate", "unknown"),
                organic_matter=soil_result.get("organic_matter", "unknown"),
                recommendations=soil_result.get("recommendations", [])
            )
        
        # Get current weather
        current_weather = await weather_service.get_current_weather(
            latitude=request.latitude,
            longitude=request.longitude
        )
        
        # Get forecast
        forecast = await weather_service.get_forecast(
            latitude=request.latitude,
            longitude=request.longitude,
            days=5
        )
        
        # Calculate rain probability from forecast
        rain_probability = 0
        if forecast:
            rainy_days = sum(1 for day in forecast if day.get("rain_total", 0) > 0)
            rain_probability = (rainy_days / len(forecast)) * 100
        
        weather_data = WeatherData(
            temperature=current_weather.get("temperature", 0),
            humidity=current_weather.get("humidity", 0),
            description=current_weather.get("description", "unknown"),
            wind_speed=current_weather.get("wind_speed", 0),
            rain_probability=rain_probability,
            forecast=forecast
        )
        
        # Get farming advice
        advice_result = weather_service.get_farming_advice(
            weather=current_weather,
            soil_data=soil_result if request.image_base64 else None,
            language=request.language.value
        )
        
        return SoilWeatherResponse(
            soil=soil_analysis,
            weather=weather_data,
            farming_advice=advice_result.get("advice", []),
            alerts=advice_result.get("alerts", [])
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Soil/Weather analysis failed: {str(e)}"
        )

@router.get("/weather")
async def get_weather_only(lat: float, lon: float, language: str = "en"):
    """
    Get weather data without soil analysis
    Quick endpoint for weather updates
    """
    
    try:
        current = await weather_service.get_current_weather(lat, lon)
        forecast = await weather_service.get_forecast(lat, lon, days=5)
        advice = weather_service.get_farming_advice(current, language=language)
        
        return {
            "current": current,
            "forecast": forecast,
            "advice": advice.get("advice", []),
            "alerts": advice.get("alerts", []),
            "farming_score": advice.get("farming_score", 50)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Weather fetch failed: {str(e)}"
        )
