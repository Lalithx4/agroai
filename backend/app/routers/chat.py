"""
Plant Chat Router
Endpoint for conversational AI with plant persona using Cerebras
"""

from fastapi import APIRouter, HTTPException
from ..models.schemas import PlantChatRequest, PlantChatResponse
from ..services.cerebras_service import cerebras_service

router = APIRouter(prefix="/api", tags=["Plant Chat"])

@router.post("/chat-with-plant", response_model=PlantChatResponse)
async def chat_with_plant(request: PlantChatRequest):
    """
    Chat with your plant using Cerebras ultra-fast inference
    
    - Plant responds based on its health status and personality
    - Supports multiple languages (en, hi, te)
    - Returns emotional responses with optional farming tips
    """
    
    try:
        # Convert conversation history to proper format
        history = [
            {"role": msg.role, "content": msg.content}
            for msg in request.conversation_history
        ]
        
        # Generate plant response using Cerebras
        result = await cerebras_service.generate_plant_response(
            user_message=request.message,
            plant_type=request.plant_type,
            health_status=request.health_status,
            diseases=request.diseases,
            conversation_history=history,
            language=request.language.value
        )
        
        return PlantChatResponse(
            response=result.get("response", "..."),
            emotion=result.get("emotion", "neutral"),
            tip=result.get("tip")
        )
        
    except Exception as e:
        # Return a friendly error response
        error_messages = {
            "en": "I'm having trouble thinking right now. Please try again!",
            "hi": "मुझे अभी सोचने में परेशानी हो रही है। कृपया फिर से कोशिश करें!",
            "te": "నాకు ఇప్పుడు ఆలోచించడంలో సమస్య ఉంది. దయచేసి మళ్ళీ ప్రయత్నించండి!"
        }
        
        return PlantChatResponse(
            response=error_messages.get(request.language.value, error_messages["en"]),
            emotion="worried",
            tip=None
        )
