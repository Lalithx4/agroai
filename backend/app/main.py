"""
CropMagix Backend - Main Application
Production-ready FastAPI server
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from .config import settings
from .routers import health_router, chat_router, future_router, soil_weather_router

# Create FastAPI application
app = FastAPI(
    title="CropMagix API",
    description="AI-powered agricultural assistant with plant disease detection, smart chat, and weather analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration for Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred",
            "code": "INTERNAL_ERROR"
        }
    )

# Include routers
app.include_router(health_router)
app.include_router(chat_router)
app.include_router(future_router)
app.include_router(soil_weather_router)

# Root endpoint
@app.get("/")
async def root():
    return {
        "name": "CropMagix API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "health_analysis": "/api/analyze-health",
            "plant_chat": "/api/chat-with-plant",
            "future_generation": "/api/generate-future",
            "soil_weather": "/api/soil-weather",
            "weather_only": "/api/weather"
        }
    }

# Health check for deployment platforms
@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
