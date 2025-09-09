"""
Modern Physio EMR - AI/ML Service
FastAPI-based microservice for AI-powered healthcare features
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from prometheus_client import make_asgi_app, Counter, Histogram, Gauge
import uvicorn

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.security import verify_jwt_token
from app.models.health import HealthResponse
from app.routers import (
    nlp,
    computer_vision, 
    speech,
    predictions,
    recommendations
)

# Prometheus metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')
ACTIVE_CONNECTIONS = Gauge('active_connections', 'Active connections')
MODEL_INFERENCE_TIME = Histogram('model_inference_duration_seconds', 'Model inference time', ['model_name'])

# Setup logging
logger = setup_logging()

# Security
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("🚀 Starting Modern Physio EMR AI Service")
    
    # Load AI models
    logger.info("Loading AI models...")
    try:
        # Initialize NLP models
        await nlp.initialize_models()
        logger.info("✅ NLP models loaded")
        
        # Initialize computer vision models  
        await computer_vision.initialize_models()
        logger.info("✅ Computer vision models loaded")
        
        # Initialize speech models
        await speech.initialize_models()  
        logger.info("✅ Speech models loaded")
        
        logger.info("🎯 All AI models loaded successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to load models: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down AI service...")

# Create FastAPI app
app = FastAPI(
    title="Modern Physio EMR - AI Service",
    description="AI/ML microservice for physiotherapy EMR with computer vision, NLP, and predictive analytics",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
    contact={
        "name": "EMR AI Team",
        "email": "ai-team@modern-physio-emr.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Custom middleware for metrics
@app.middleware("http")
async def metrics_middleware(request, call_next):
    ACTIVE_CONNECTIONS.inc()
    
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    REQUEST_COUNT.labels(method=request.method, endpoint=request.url.path).inc()
    REQUEST_DURATION.observe(duration)
    ACTIVE_CONNECTIONS.dec()
    
    return response

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "path": request.url.path
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "path": request.url.path
        }
    )

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and get current user"""
    try:
        payload = verify_jwt_token(credentials.credentials)
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Health check endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Basic health check"""
    return HealthResponse(
        status="healthy",
        service="ai-service",
        version="1.0.0"
    )

@app.get("/health/ready", response_model=HealthResponse)
async def readiness_check():
    """Readiness check - verify all models are loaded"""
    try:
        # Check if models are loaded
        models_ready = (
            nlp.models_loaded and 
            computer_vision.models_loaded and 
            speech.models_loaded
        )
        
        if models_ready:
            return HealthResponse(
                status="ready",
                service="ai-service", 
                version="1.0.0",
                details={"models_loaded": True}
            )
        else:
            raise HTTPException(
                status_code=503,
                detail="Models not loaded"
            )
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Service not ready: {e}"
        )

@app.get("/health/live")
async def liveness_check():
    """Liveness check"""
    return {"status": "alive", "service": "ai-service"}

# API Routes
app.include_router(
    nlp.router,
    prefix="/api/v1/nlp",
    tags=["Natural Language Processing"],
    dependencies=[Depends(get_current_user)]
)

app.include_router(
    computer_vision.router,
    prefix="/api/v1/vision",
    tags=["Computer Vision"],
    dependencies=[Depends(get_current_user)]
)

app.include_router(
    speech.router,
    prefix="/api/v1/speech",
    tags=["Speech Processing"],
    dependencies=[Depends(get_current_user)]
)

app.include_router(
    predictions.router,
    prefix="/api/v1/predictions",
    tags=["Predictive Analytics"],
    dependencies=[Depends(get_current_user)]
)

app.include_router(
    recommendations.router,
    prefix="/api/v1/recommendations",
    tags=["Treatment Recommendations"],
    dependencies=[Depends(get_current_user)]
)

# Root endpoint
@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "service": "Modern Physio EMR - AI Service",
        "version": "1.0.0",
        "description": "AI/ML microservice for physiotherapy EMR",
        "docs_url": "/docs",
        "health_check": "/health",
        "endpoints": {
            "nlp": "/api/v1/nlp",
            "computer_vision": "/api/v1/vision", 
            "speech": "/api/v1/speech",
            "predictions": "/api/v1/predictions",
            "recommendations": "/api/v1/recommendations"
        }
    }

# API Information endpoint
@app.get("/api/v1/info")
async def api_info():
    """Get API information and available models"""
    return {
        "ai_capabilities": {
            "nlp": {
                "clinical_note_analysis": True,
                "medical_entity_extraction": True,
                "sentiment_analysis": True,
                "language_support": ["en", "vi"]
            },
            "computer_vision": {
                "posture_analysis": True,
                "exercise_recognition": True,
                "medical_image_analysis": True,
                "progress_photo_comparison": True
            },
            "speech": {
                "voice_to_text": True,
                "clinical_dictation": True,
                "language_support": ["en", "vi"]
            },
            "predictions": {
                "treatment_outcomes": True,
                "recovery_timeline": True,
                "risk_assessment": True
            },
            "recommendations": {
                "exercise_suggestions": True,
                "treatment_protocols": True,
                "personalized_care_plans": True
            }
        },
        "performance": {
            "average_inference_time": "< 500ms",
            "supported_file_formats": {
                "images": ["jpg", "png", "tiff", "dicom"],
                "audio": ["wav", "mp3", "m4a"],
                "video": ["mp4", "avi", "mov"]
            },
            "max_file_size": "50MB"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info" if not settings.DEBUG else "debug",
        access_log=True,
        workers=1 if settings.DEBUG else 4,
    )