"""
Gemini Service - Multimodal AI for image analysis
Uses Google Gemini 2.0 Flash for vision tasks
"""

import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import base64
import json
import re
from typing import Optional, Dict, Any
from ..config import settings

class GeminiService:
    """Service for Gemini AI image analysis"""
    
    def __init__(self):
        if settings.GOOGLE_AI_API_KEY:
            genai.configure(api_key=settings.GOOGLE_AI_API_KEY)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        else:
            self.model = None
            print("Warning: GOOGLE_AI_API_KEY not configured")
    
    async def analyze_plant_health(
        self, 
        image_base64: str, 
        plant_type: Optional[str] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Analyze plant health from image
        Returns disease detection, severity, and recommendations
        """
        
        language_instructions = {
            "en": "Respond in English.",
            "hi": "Respond in Hindi (हिंदी में जवाब दें).",
            "te": "Respond in Telugu (తెలుగులో సమాధానం ఇవ్వండి)."
        }
        
        prompt = f"""You are an expert agricultural plant pathologist. Analyze this plant image carefully.

{language_instructions.get(language, language_instructions["en"])}

{f"The plant is identified as: {plant_type}" if plant_type else "First identify the plant type."}

Provide your analysis in this exact JSON format:
{{
    "plant_type": "identified plant name",
    "health_status": "healthy|mild|moderate|severe",
    "diseases": [
        {{
            "name": "disease name",
            "confidence": 85.5,
            "severity": "low|medium|high|critical",
            "description": "brief description of the disease"
        }}
    ],
    "recommendations": [
        "specific actionable recommendation 1",
        "specific actionable recommendation 2",
        "specific actionable recommendation 3"
    ],
    "confidence": 90.0,
    "summary": "2-3 sentence summary for the farmer in simple language"
}}

Be accurate but also practical - farmers need actionable advice. If the plant looks healthy, say so.
Return ONLY valid JSON, no markdown formatting."""

        try:
            if not self.model:
                raise Exception("Gemini API not configured")
            
            # Decode base64 image
            image_data = base64.b64decode(image_base64)
            
            # Create image part for Gemini using PIL
            import io
            from PIL import Image
            
            image = Image.open(io.BytesIO(image_data))
            
            # Generate content with image
            response = self.model.generate_content(
                [prompt, image],
                safety_settings={
                    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                }
            )
            
            # Parse JSON response
            response_text = response.text.strip()
            # Remove markdown code blocks if present
            if response_text.startswith("```"):
                response_text = re.sub(r'^```json?\n?', '', response_text)
                response_text = re.sub(r'\n?```$', '', response_text)
            
            result = json.loads(response_text)
            return result
            
        except json.JSONDecodeError as e:
            return {
                "plant_type": plant_type or "Unknown",
                "health_status": "unknown",
                "diseases": [],
                "recommendations": ["Please retake the photo with better lighting"],
                "confidence": 0,
                "summary": "Could not analyze the image. Please try again with a clearer photo.",
                "error": str(e)
            }
        except Exception as e:
            raise Exception(f"Gemini analysis failed: {str(e)}")
    
    async def analyze_soil(
        self, 
        image_base64: str,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Analyze soil from image
        Returns soil type, texture, moisture estimation
        """
        
        language_instructions = {
            "en": "Respond in English.",
            "hi": "Respond in Hindi (हिंदी में जवाब दें).",
            "te": "Respond in Telugu (తెలుగులో సమాధానం ఇవ్వండి)."
        }
        
        prompt = f"""You are an expert soil scientist and agronomist. Analyze this soil image carefully.

{language_instructions.get(language, language_instructions["en"])}

Provide your analysis in this exact JSON format:
{{
    "soil_type": "clay|sandy|loamy|silty|peaty|chalky",
    "texture": "fine|medium|coarse",
    "moisture_level": "dry|slightly_moist|moist|wet|waterlogged",
    "ph_estimate": "acidic|slightly_acidic|neutral|slightly_alkaline|alkaline",
    "organic_matter": "low|medium|high",
    "color_analysis": "description of soil color and what it indicates",
    "recommendations": [
        "specific soil improvement recommendation 1",
        "specific soil improvement recommendation 2",
        "what crops would grow well in this soil"
    ]
}}

Return ONLY valid JSON, no markdown formatting."""

        try:
            if not self.model:
                raise Exception("Gemini API not configured")
                
            import io
            from PIL import Image
            
            image_data = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_data))
            
            response = self.model.generate_content(
                [prompt, image],
                safety_settings={
                    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                }
            )
            
            response_text = response.text.strip()
            if response_text.startswith("```"):
                response_text = re.sub(r'^```json?\n?', '', response_text)
                response_text = re.sub(r'\n?```$', '', response_text)
            
            return json.loads(response_text)
            
        except Exception as e:
            return {
                "soil_type": "unknown",
                "texture": "unknown",
                "moisture_level": "unknown",
                "ph_estimate": "unknown",
                "organic_matter": "unknown",
                "recommendations": ["Please retake the soil photo with better lighting"],
                "error": str(e)
            }
    
    async def generate_future_description(
        self,
        disease: str,
        scenario: str,
        days_ahead: int,
        language: str = "en"
    ) -> str:
        """
        Generate description of future plant state
        Used alongside image generation
        """
        
        language_instructions = {
            "en": "Respond in English.",
            "hi": "Respond in Hindi.",
            "te": "Respond in Telugu."
        }
        
        if scenario == "untreated":
            prompt = f"""Describe in 2-3 simple sentences what a plant with {disease} will look like 
            in {days_ahead} days if left UNTREATED. Be realistic but not overly alarming.
            {language_instructions.get(language, language_instructions["en"])}"""
        else:
            prompt = f"""Describe in 2-3 simple sentences what a plant with {disease} will look like 
            in {days_ahead} days if properly TREATED. Be encouraging and positive.
            {language_instructions.get(language, language_instructions["en"])}"""
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            if scenario == "untreated":
                return "Without treatment, the disease may spread and cause more damage to the plant."
            return "With proper treatment, the plant should show signs of recovery and improved health."


# Singleton instance
gemini_service = GeminiService()
