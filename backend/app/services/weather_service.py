"""
Weather Service - OpenWeatherMap integration
Fetches weather data for farming recommendations
"""

import httpx
from typing import Dict, Any, Optional, List
from datetime import datetime
from ..config import settings

class WeatherService:
    """Service for weather data retrieval and analysis"""
    
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
        self.base_url = "https://api.openweathermap.org/data/2.5"
    
    async def get_current_weather(
        self,
        latitude: float,
        longitude: float
    ) -> Dict[str, Any]:
        """
        Get current weather for coordinates
        """
        
        # If no API key, return mock data for testing
        if not self.api_key:
            return self._get_mock_weather(latitude, longitude)
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/weather",
                    params={
                        "lat": latitude,
                        "lon": longitude,
                        "appid": self.api_key,
                        "units": "metric"
                    }
                )
                response.raise_for_status()
                data = response.json()
                
                return {
                    "temperature": data["main"]["temp"],
                    "feels_like": data["main"]["feels_like"],
                    "humidity": data["main"]["humidity"],
                    "pressure": data["main"]["pressure"],
                    "description": data["weather"][0]["description"],
                    "icon": data["weather"][0]["icon"],
                    "wind_speed": data["wind"]["speed"],
                    "clouds": data["clouds"]["all"],
                    "visibility": data.get("visibility", 10000) / 1000,  # km
                    "rain_1h": data.get("rain", {}).get("1h", 0),
                    "location": data.get("name", "Unknown")
                }
                
            except Exception as e:
                return self._get_mock_weather(latitude, longitude, error=str(e))
    
    async def get_forecast(
        self,
        latitude: float,
        longitude: float,
        days: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Get weather forecast for the next few days
        """
        
        if not self.api_key:
            return self._get_mock_forecast()
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/forecast",
                    params={
                        "lat": latitude,
                        "lon": longitude,
                        "appid": self.api_key,
                        "units": "metric",
                        "cnt": days * 8  # 8 forecasts per day (3-hour intervals)
                    }
                )
                response.raise_for_status()
                data = response.json()
                
                # Process forecast into daily summaries
                daily_forecasts = {}
                for item in data["list"]:
                    date = datetime.fromtimestamp(item["dt"]).strftime("%Y-%m-%d")
                    
                    if date not in daily_forecasts:
                        daily_forecasts[date] = {
                            "date": date,
                            "temps": [],
                            "humidity": [],
                            "descriptions": [],
                            "rain": 0
                        }
                    
                    daily_forecasts[date]["temps"].append(item["main"]["temp"])
                    daily_forecasts[date]["humidity"].append(item["main"]["humidity"])
                    daily_forecasts[date]["descriptions"].append(item["weather"][0]["description"])
                    daily_forecasts[date]["rain"] += item.get("rain", {}).get("3h", 0)
                
                # Calculate daily averages
                result = []
                for date, day_data in list(daily_forecasts.items())[:days]:
                    result.append({
                        "date": date,
                        "temp_min": min(day_data["temps"]),
                        "temp_max": max(day_data["temps"]),
                        "temp_avg": sum(day_data["temps"]) / len(day_data["temps"]),
                        "humidity_avg": sum(day_data["humidity"]) / len(day_data["humidity"]),
                        "description": max(set(day_data["descriptions"]), key=day_data["descriptions"].count),
                        "rain_total": day_data["rain"]
                    })
                
                return result
                
            except Exception as e:
                return self._get_mock_forecast()
    
    def get_farming_advice(
        self,
        weather: Dict[str, Any],
        soil_data: Optional[Dict[str, Any]] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Generate farming advice based on weather and soil conditions
        """
        
        advice = []
        alerts = []
        
        temp = weather.get("temperature", 25)
        humidity = weather.get("humidity", 50)
        rain = weather.get("rain_1h", 0)
        wind = weather.get("wind_speed", 0)
        
        # Temperature-based advice
        if temp > 35:
            alerts.append(self._translate("🌡️ Extreme heat warning! Protect your crops.", language))
            advice.append(self._translate("Water plants early morning or evening, not midday.", language))
            advice.append(self._translate("Use mulch to keep soil cool and retain moisture.", language))
        elif temp > 30:
            advice.append(self._translate("Hot weather - ensure adequate watering.", language))
        elif temp < 10:
            alerts.append(self._translate("❄️ Cold weather alert! Protect sensitive crops.", language))
            advice.append(self._translate("Cover young plants to protect from cold.", language))
        
        # Humidity-based advice
        if humidity > 80:
            alerts.append(self._translate("💧 High humidity - watch for fungal diseases.", language))
            advice.append(self._translate("Improve air circulation around plants.", language))
            advice.append(self._translate("Avoid overhead watering to prevent disease.", language))
        elif humidity < 30:
            advice.append(self._translate("Low humidity - plants may need extra water.", language))
        
        # Rain-based advice
        if rain > 10:
            alerts.append(self._translate("🌧️ Heavy rain expected - check drainage.", language))
            advice.append(self._translate("Delay pesticide application until rain stops.", language))
        elif rain > 0:
            advice.append(self._translate("Light rain expected - good for crops.", language))
        else:
            advice.append(self._translate("No rain expected - water as needed.", language))
        
        # Wind-based advice
        if wind > 10:
            alerts.append(self._translate("💨 Strong winds - stake tall plants.", language))
            advice.append(self._translate("Delay spraying operations.", language))
        
        # Combine with soil data if available
        if soil_data:
            moisture = soil_data.get("moisture_level", "").lower()
            if moisture == "dry" and rain == 0:
                alerts.append(self._translate("🏜️ Dry soil + no rain - irrigation urgent!", language))
            elif moisture == "waterlogged":
                alerts.append(self._translate("⚠️ Soil waterlogged - improve drainage.", language))
        
        # Add general good practice
        if not alerts:
            advice.append(self._translate("✅ Good conditions for farming today!", language))
        
        return {
            "advice": advice,
            "alerts": alerts,
            "farming_score": self._calculate_farming_score(weather)
        }
    
    def _calculate_farming_score(self, weather: Dict[str, Any]) -> int:
        """Calculate a simple 0-100 farming conditions score"""
        
        score = 100
        
        temp = weather.get("temperature", 25)
        if temp < 10 or temp > 35:
            score -= 30
        elif temp < 15 or temp > 30:
            score -= 15
        
        humidity = weather.get("humidity", 50)
        if humidity > 85 or humidity < 25:
            score -= 20
        elif humidity > 75 or humidity < 35:
            score -= 10
        
        rain = weather.get("rain_1h", 0)
        if rain > 20:
            score -= 25
        elif rain > 10:
            score -= 15
        
        wind = weather.get("wind_speed", 0)
        if wind > 15:
            score -= 20
        elif wind > 10:
            score -= 10
        
        return max(0, min(100, score))
    
    def _translate(self, text: str, language: str) -> str:
        """Simple translation helper - in production, use proper i18n"""
        
        # For now, return as-is (translations handled in frontend)
        # In production, integrate with translation service
        return text
    
    def _get_mock_weather(
        self, 
        lat: float, 
        lon: float, 
        error: Optional[str] = None
    ) -> Dict[str, Any]:
        """Return mock weather data for testing"""
        
        return {
            "temperature": 28,
            "feels_like": 30,
            "humidity": 65,
            "pressure": 1013,
            "description": "partly cloudy",
            "icon": "02d",
            "wind_speed": 3.5,
            "clouds": 40,
            "visibility": 10,
            "rain_1h": 0,
            "location": f"Location ({lat:.2f}, {lon:.2f})",
            "mock": True,
            "error": error
        }
    
    def _get_mock_forecast(self) -> List[Dict[str, Any]]:
        """Return mock forecast data"""
        
        from datetime import timedelta
        
        forecasts = []
        base_date = datetime.now()
        
        for i in range(5):
            date = base_date + timedelta(days=i)
            forecasts.append({
                "date": date.strftime("%Y-%m-%d"),
                "temp_min": 22 + i,
                "temp_max": 32 + i,
                "temp_avg": 27 + i,
                "humidity_avg": 60 - i * 2,
                "description": ["sunny", "partly cloudy", "cloudy", "light rain", "sunny"][i],
                "rain_total": [0, 0, 2, 8, 0][i],
                "mock": True
            })
        
        return forecasts


# Singleton instance
weather_service = WeatherService()
