"""
Health Analysis Router
Endpoint for plant disease detection using Gemini Vision
"""

from fastapi import APIRouter, HTTPException
from ..models.schemas import HealthAnalysisRequest, HealthAnalysisResponse, Disease
from ..services.gemini_service import gemini_service

router = APIRouter(prefix="/api", tags=["Health Analysis"])

@router.post("/analyze-health", response_model=HealthAnalysisResponse)
async def analyze_plant_health(request: HealthAnalysisRequest):
    """
    Analyze plant health from an uploaded image
    
    - Uses Gemini 2.0 Flash Vision for accurate disease detection
    - Supports multiple languages (en, hi, te)
    - Returns disease list, confidence scores, and recommendations
    """
    
    try:
        # Clean base64 string if it has data URL prefix
        image_data = request.image_base64
        if "," in image_data:
            image_data = image_data.split(",")[1]
        
        # Call Gemini service
        result = await gemini_service.analyze_plant_health(
            image_base64=image_data,
            plant_type=request.plant_type,
            language=request.language.value
        )
        
        # Parse diseases into proper format
        diseases = []
        for disease_data in result.get("diseases", []):
            diseases.append(Disease(
                name=disease_data.get("name", "Unknown"),
                confidence=disease_data.get("confidence", 0),
                severity=disease_data.get("severity", "unknown"),
                description=disease_data.get("description", "")
            ))
        
        return HealthAnalysisResponse(
            plant_type=result.get("plant_type", request.plant_type or "Unknown"),
            health_status=result.get("health_status", "unknown"),
            diseases=diseases,
            recommendations=result.get("recommendations", []),
            confidence=result.get("confidence", 0),
            summary=result.get("summary", "Analysis complete.")
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Health analysis failed: {str(e)}"
        )

@router.get("/health-check")
async def health_check():
    """Simple health check endpoint"""
    return {"status": "healthy", "service": "CropMagix API"}
