# ML Service for Crop Stress Monitoring

Production-ready ML service for crop stress prediction using hybrid approach (ML + Rules).

## Features

- ✅ Lightweight ML (Random Forest)
- ✅ Rule-based validation
- ✅ Feature engineering
- ✅ Severity computation
- ✅ Human-readable explanations
- ✅ FastAPI REST API
- ✅ No deep learning (fast inference)

## Architecture

```
Input Data → Feature Engineering → ML Model → Rule Engine → Severity → Explainability → Output
```

## Installation

```bash
cd ml-service
pip install -r requirements.txt
```

## Running the Service

```bash
# Development
python app.py

# Production with uvicorn
uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

## API Usage

### Health Check
```bash
GET http://localhost:8001/health
```

### Predict Stress
```bash
POST http://localhost:8001/api/predict

{
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
```

### Response
```json
{
  "stress_type": "moisture_stress",
  "severity": "medium",
  "severity_color": "amber",
  "confidence": 78.5,
  "advisory": "Increase irrigation frequency by 20%. Consider light irrigation at critical times.",
  "explanation": "Moisture stress detected in wheat during tillering stage. Field has experienced approximately 11 consecutive dry days. Recent rainfall has been below normal levels for winter season. Soil type (loam) has moderate water retention capacity. Seasonal baseline applied: winter.",
  "metadata": {
    "growth_stage": "tillering",
    "days_after_sowing": 64,
    "season": "winter",
    "ml_prediction": "moisture_stress",
    "ml_confidence": 75.2,
    "validation_reason": "validated"
  }
}
```

## Stress Types

1. **moisture_stress** - Water deficit affecting crop growth
2. **heat_stress** - High temperature stress
3. **waterlogging** - Excess water reducing soil oxygen
4. **no_stress** - Normal conditions

## Severity Levels

- **Low** (Yellow) - Early warning, monitor closely
- **Medium** (Amber) - Action recommended
- **High** (Red) - Immediate intervention required

## Model Details

- **Algorithm**: Random Forest Classifier
- **Features**: 11 engineered features
- **Validation**: Rule-based agronomic logic
- **Inference Time**: < 50ms per prediction

## Integration

```python
from src.stress_predictor import CropStressPredictor

predictor = CropStressPredictor()

result = predictor.predict({
    "crop_type": "wheat",
    "sowing_date": "2025-11-15",
    "soil_type": "loam",
    "season": "winter",
    "weather": {...}
})

print(result['advisory'])
print(result['explanation'])
```

## Project Structure

```
ml-service/
├── app.py                    # FastAPI application
├── requirements.txt          # Dependencies
├── src/
│   ├── __init__.py
│   ├── feature_engineering.py   # Feature computation
│   ├── model.py                 # ML model
│   ├── rule_engine.py           # Rule validation
│   ├── severity.py              # Severity logic
│   ├── explainer.py             # Explainability
│   └── stress_predictor.py      # Main orchestrator
```

## License

Part of Climate-Aware Crop Stress Monitoring System (GDG Hackathon 2026)
