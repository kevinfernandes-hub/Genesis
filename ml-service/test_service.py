"""
Test ML Service - Simple validation script
"""

import sys
import json
from datetime import datetime

# Add src to path
sys.path.insert(0, 'src')

from feature_engineering import engineer_features
from stress_predictor import CropStressPredictor

def test_prediction():
    """Test the ML prediction pipeline"""
    
    print("=" * 60)
    print("CROP STRESS MONITORING - ML SERVICE TEST")
    print("=" * 60)
    print()
    
    # Test input
    test_input = {
        "crop_type": "wheat",
        "sowing_date": "2025-11-15",
        "soil_type": "loam",
        "season": "winter",
        "weather": {
            "avg_temp": 32.0,
            "rainfall": 2.0,
            "rolling_7day_rainfall": 8.0,
            "consecutive_dry_days": 10,
            "temp_deviation_from_normal": 4.5
        }
    }
    
    print("Input Data:")
    print(json.dumps(test_input, indent=2))
    print()
    
    try:
        # Initialize predictor
        print("Initializing ML model...")
        predictor = CropStressPredictor()
        print("✓ Model initialized successfully")
        print()
        
        # Run prediction
        print("Running prediction pipeline...")
        result = predictor.predict(test_input)
        print("✓ Prediction completed")
        print()
        
        # Display results
        print("=" * 60)
        print("PREDICTION RESULTS")
        print("=" * 60)
        print()
        print(f"Stress Type:    {result['stress_type']}")
        print(f"Severity:       {result['severity']} ({result['severity_color']})")
        print(f"Confidence:     {result['confidence']}%")
        print()
        print(f"Advisory:")
        print(f"  {result['advisory']}")
        print()
        print(f"Explanation:")
        print(f"  {result['explanation']}")
        print()
        print(f"Metadata:")
        print(f"  Growth Stage: {result['metadata']['growth_stage']}")
        print(f"  Days After Sowing: {result['metadata']['days_after_sowing']}")
        print(f"  ML Prediction: {result['metadata']['ml_prediction']} ({result['metadata']['ml_confidence']}%)")
        print(f"  Validation: {result['metadata']['validation_reason']}")
        print()
        print("=" * 60)
        print("✓ TEST PASSED - ML Service Working Correctly")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"✗ TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_prediction()
    sys.exit(0 if success else 1)
