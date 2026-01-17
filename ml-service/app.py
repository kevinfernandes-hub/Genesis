"""
FastAPI Application for Crop Stress Prediction
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

from src.stress_predictor import CropStressPredictor

# Initialize FastAPI app
app = FastAPI(
    title="Crop Stress Monitoring API",
    description="ML-powered crop stress prediction system for precision agriculture",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize predictor
predictor = CropStressPredictor()


# Request models
class WeatherData(BaseModel):
    avg_temp: float = Field(..., description="Average temperature (°C)")
    rainfall: float = Field(0.0, description="Recent rainfall (mm)")
    rolling_7day_rainfall: float = Field(0.0, description="7-day cumulative rainfall (mm)")
    consecutive_dry_days: int = Field(0, description="Number of consecutive dry days")
    temp_deviation_from_normal: float = Field(0.0, description="Temperature deviation from normal (°C)")


class StressPredictionRequest(BaseModel):
    crop_type: str = Field(..., description="Type of crop (wheat, rice, maize, cotton)")
    sowing_date: str = Field(..., description="Sowing date (YYYY-MM-DD)")
    soil_type: str = Field(..., description="Soil type (clay, loam, sandy, etc.)")
    season: str = Field(..., description="Current season (monsoon, winter, summer)")
    weather: WeatherData = Field(..., description="Weather data")
    
    class Config:
        json_schema_extra = {
            "example": {
                "crop_type": "wheat",
                "sowing_date": "2025-11-15",
                "soil_type": "loam",
                "season": "winter",
                "weather": {
                    "avg_temp": 28.5,
                    "rainfall": 5.0,
                    "rolling_7day_rainfall": 15.0,
                    "consecutive_dry_days": 8,
                    "temp_deviation_from_normal": 3.5
                }
            }
        }


# Response models
class StressPredictionResponse(BaseModel):
    stress_type: str
    severity: str
    severity_color: str
    confidence: float
    advisory: str
    explanation: str
    metadata: Dict[str, Any]


# Endpoints
@app.get("/")
def root():
    """Root endpoint - API info"""
    return {
        "service": "Crop Stress Monitoring API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "health": "/health",
            "predict": "/api/predict",
            "batch_predict": "/api/batch-predict"
        }
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "model_loaded": predictor.ml_model.model is not None
    }


@app.post("/api/predict", response_model=StressPredictionResponse)
def predict_stress(request: StressPredictionRequest):
    """
    Predict crop stress from input data
    
    Args:
        request: Crop and weather data
    
    Returns:
        Stress prediction with advisory and explanation
    """
    try:
        # Convert request to dict
        input_data = request.model_dump()
        
        # Run prediction
        result = predictor.predict(input_data)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/api/batch-predict")
def batch_predict_stress(requests: list[StressPredictionRequest]):
    """
    Predict stress for multiple crops
    
    Args:
        requests: List of crop and weather data
    
    Returns:
        List of stress predictions
    """
    try:
        # Convert requests to dicts
        input_batch = [req.model_dump() for req in requests]
        
        # Run batch prediction
        results = predictor.batch_predict(input_batch)
        
        return {"predictions": results}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")


@app.get("/api/model/info")
def model_info():
    """Get model information"""
    feature_importance = predictor.ml_model.get_feature_importance()
    
    return {
        "model_type": "Random Forest Classifier",
        "n_estimators": 50,
        "max_depth": 10,
        "features": list(feature_importance.keys()),
        "feature_importance": feature_importance,
        "stress_types": ["moisture_stress", "heat_stress", "waterlogging", "no_stress"]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
