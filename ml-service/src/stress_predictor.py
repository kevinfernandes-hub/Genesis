"""
Main Stress Predictor
Orchestrates the entire prediction pipeline
"""

from typing import Dict, Any
from .feature_engineering import engineer_features
from .model import StressMLModel
from .rule_engine import apply_rules
from .severity import compute_severity
from .explainer import generate_explanation, generate_advisory


class CropStressPredictor:
    """
    Main orchestrator for crop stress prediction
    """
    
    def __init__(self):
        self.ml_model = StressMLModel()
    
    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Complete prediction pipeline
        
        Args:
            input_data: Raw input data containing crop, weather, soil info
        
        Returns:
            Complete prediction result with explanations
        """
        # Step 1: Feature Engineering
        features = engineer_features(input_data)
        
        # Step 2: ML Model Prediction
        ml_stress_type, ml_confidence = self.ml_model.predict(features)
        
        # Step 3: Rule-based Validation
        validated_stress_type, validated_confidence, validation_reason = apply_rules(
            features,
            ml_stress_type,
            ml_confidence
        )
        
        # Step 4: Compute Severity
        severity, severity_color = compute_severity(
            validated_stress_type,
            validated_confidence,
            features
        )
        
        # Step 5: Generate Explanation
        explanation = generate_explanation(
            validated_stress_type,
            severity,
            features,
            validated_confidence,
            validation_reason
        )
        
        # Step 6: Generate Advisory
        advisory = generate_advisory(
            validated_stress_type,
            severity,
            features
        )
        
        # Package results
        result = {
            'stress_type': validated_stress_type,
            'severity': severity,
            'severity_color': severity_color,
            'confidence': round(validated_confidence * 100, 1),
            'advisory': advisory,
            'explanation': explanation,
            'metadata': {
                'growth_stage': features['growth_stage'],
                'days_after_sowing': features['days_after_sowing'],
                'season': features['season'],
                'ml_prediction': ml_stress_type,
                'ml_confidence': round(ml_confidence * 100, 1),
                'validation_reason': validation_reason
            }
        }
        
        return result
    
    def batch_predict(self, input_batch: list) -> list:
        """
        Predict for multiple inputs
        
        Args:
            input_batch: List of input data dictionaries
        
        Returns:
            List of prediction results
        """
        return [self.predict(input_data) for input_data in input_batch]
