"""
Cerebras Service - Ultra-fast LLM inference
Uses Cerebras API for instant text generation
"""

import httpx
import json
from typing import List, Dict, Any, Optional
from ..config import settings

class CerebrasService:
    """Service for Cerebras ultra-fast inference"""
    
    def __init__(self):
        self.api_key = settings.CEREBRAS_API_KEY
        self.base_url = "https://api.cerebras.ai/v1"
        self.model = settings.CEREBRAS_MODEL
    
    async def chat(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> str:
        """
        Send chat request to Cerebras
        Returns generated response
        """
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Build messages array with system prompt
        full_messages = [
            {"role": "system", "content": system_prompt}
        ] + messages
        
        payload = {
            "model": self.model,
            "messages": full_messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                
                data = response.json()
                return data["choices"][0]["message"]["content"]
                
            except httpx.HTTPStatusError as e:
                raise Exception(f"Cerebras API error: {e.response.status_code} - {e.response.text}")
            except Exception as e:
                raise Exception(f"Cerebras request failed: {str(e)}")
    
    async def generate_plant_response(
        self,
        user_message: str,
        plant_type: str,
        health_status: str,
        diseases: List[str],
        conversation_history: List[Dict[str, str]],
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Generate a response as if the plant is speaking
        Returns response with emotion and optional tip
        """
        
        from .plant_persona import PlantPersona
        
        # Get the appropriate system prompt
        system_prompt = PlantPersona.get_persona(
            plant_type=plant_type,
            health_status=health_status,
            diseases=diseases,
            language=language
        )
        
        # Format conversation history
        messages = []
        for msg in conversation_history[-6:]:  # Keep last 6 messages for context
            messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", "")
            })
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": user_message
        })
        
        try:
            response_text = await self.chat(
                messages=messages,
                system_prompt=system_prompt,
                temperature=0.8,
                max_tokens=300
            )
            
            # Determine emotion based on health status and response
            emotion = self._detect_emotion(health_status, response_text)
            
            # Extract any farming tip if present
            tip = self._extract_tip(response_text)
            
            return {
                "response": response_text,
                "emotion": emotion,
                "tip": tip
            }
            
        except Exception as e:
            # Fallback response
            fallback_responses = {
                "en": "I'm having trouble speaking right now. Please try again!",
                "hi": "मुझे अभी बोलने में परेशानी हो रही है। कृपया फिर से प्रयास करें!",
                "te": "నాకు ఇప్పుడు మాట్లాడటంలో సమస్య ఉంది. దయచేసి మళ్ళీ ప్రయత్నించండి!"
            }
            return {
                "response": fallback_responses.get(language, fallback_responses["en"]),
                "emotion": "worried",
                "tip": None,
                "error": str(e)
            }
    
    def _detect_emotion(self, health_status: str, response: str) -> str:
        """Detect emotion based on health and response content"""
        
        # Check response for emotional indicators
        response_lower = response.lower()
        
        if health_status == "healthy":
            if any(word in response_lower for word in ["thank", "happy", "great", "wonderful"]):
                return "happy"
            return "happy"
        
        elif health_status == "severe":
            if any(word in response_lower for word in ["help", "pain", "sick", "bad"]):
                return "sad"
            return "worried"
        
        elif health_status in ["mild", "moderate"]:
            if any(word in response_lower for word in ["better", "hope", "healing"]):
                return "grateful"
            if any(word in response_lower for word in ["itch", "annoy", "bother"]):
                return "grumpy"
            return "worried"
        
        return "neutral"
    
    def _extract_tip(self, response: str) -> Optional[str]:
        """Extract farming tip from response if present"""
        
        tip_indicators = ["tip:", "advice:", "remember:", "pro tip:", "सुझाव:", "చిట్కా:"]
        
        response_lower = response.lower()
        for indicator in tip_indicators:
            if indicator in response_lower:
                # Find the tip after the indicator
                idx = response_lower.find(indicator)
                tip_text = response[idx + len(indicator):].strip()
                # Take first sentence
                if "." in tip_text:
                    return tip_text[:tip_text.index(".") + 1]
                return tip_text[:150] if len(tip_text) > 150 else tip_text
        
        return None


# Singleton instance
cerebras_service = CerebrasService()
