"""
Rule Engine Module
Validate ML predictions using agronomic rules
"""

from typing import Dict, Tuple


# Critical growth stages for each crop
CRITICAL_STAGES = {
    'wheat': ['flowering', 'grain_filling'],
    'rice': ['flowering', 'grain_filling'],
    'maize': ['flowering', 'grain_filling'],
    'cotton': ['flowering', 'boll_development']
}


def validate_moisture_stress(features: Dict, confidence: float) -> Tuple[str, float, str]:
    """
    Validate moisture stress prediction
    
    Args:
        features: Engineered features
        confidence: ML model confidence
    
    Returns:
        (validated_stress_type, adjusted_confidence, reason)
    """
    dry_days = features['dry_days_norm']
    rainfall = features['rolling_rainfall_norm']
    moisture_indicator = features['moisture_stress']
    growth_stage = features['growth_stage']
    crop_type = features['crop_type']
    
    # Rule 1: High confidence if clear indicators
    if dry_days > 0.7 and rainfall < 0.2 and moisture_indicator > 0.6:
        return 'moisture_stress', max(confidence, 0.85), 'high_dry_period'
    
    # Rule 2: Critical stage amplification
    if growth_stage in CRITICAL_STAGES.get(crop_type, []):
        if moisture_indicator > 0.5:
            adjusted_conf = min(confidence * 1.2, 0.95)
            return 'moisture_stress', adjusted_conf, 'critical_stage'
    
    # Rule 3: False positive filter
    if rainfall > 0.5 and dry_days < 0.3:
        return 'no_stress', 0.0, 'sufficient_rainfall'
    
    return 'moisture_stress', confidence, 'validated'


def validate_heat_stress(features: Dict, confidence: float) -> Tuple[str, float, str]:
    """
    Validate heat stress prediction
    
    Args:
        features: Engineered features
        confidence: ML model confidence
    
    Returns:
        (validated_stress_type, adjusted_confidence, reason)
    """
    temp = features['avg_temp_norm']
    temp_dev = features['temp_deviation_norm']
    heat_indicator = features['heat_stress']
    growth_stage = features['growth_stage']
    crop_type = features['crop_type']
    
    # Rule 1: Strong heat signal
    if temp > 0.8 and temp_dev > 0.7:
        return 'heat_stress', max(confidence, 0.85), 'extreme_heat'
    
    # Rule 2: Critical stage sensitivity
    if growth_stage in CRITICAL_STAGES.get(crop_type, []):
        if heat_indicator > 0.6:
            adjusted_conf = min(confidence * 1.15, 0.95)
            return 'heat_stress', adjusted_conf, 'critical_stage_heat'
    
    # Rule 3: False positive filter
    if temp < 0.5 and temp_dev < 0.4:
        return 'no_stress', 0.0, 'normal_temperature'
    
    return 'heat_stress', confidence, 'validated'


def validate_waterlogging(features: Dict, confidence: float) -> Tuple[str, float, str]:
    """
    Validate waterlogging prediction
    
    Args:
        features: Engineered features
        confidence: ML model confidence
    
    Returns:
        (validated_stress_type, adjusted_confidence, reason)
    """
    rainfall = features['rainfall_norm']
    rolling_rain = features['rolling_rainfall_norm']
    soil_retention = features['soil_retention']
    water_indicator = features['waterlogging']
    
    # Rule 1: Heavy rain + poor drainage
    if rolling_rain > 0.7 and soil_retention > 0.35:
        return 'waterlogging', max(confidence, 0.80), 'heavy_rainfall_poor_drainage'
    
    # Rule 2: Sandy soil reduces waterlogging risk
    if soil_retention < 0.20:
        return 'no_stress', 0.0, 'good_drainage'
    
    # Rule 3: Recent heavy rain
    if rainfall > 0.8 and rolling_rain > 0.6:
        adjusted_conf = min(confidence * 1.1, 0.90)
        return 'waterlogging', adjusted_conf, 'recent_heavy_rain'
    
    # Rule 4: False positive filter
    if rolling_rain < 0.3:
        return 'no_stress', 0.0, 'insufficient_rainfall'
    
    return 'waterlogging', confidence, 'validated'


def apply_rules(features: Dict, ml_prediction: str, ml_confidence: float) -> Tuple[str, float, str]:
    """
    Apply rule-based validation to ML prediction
    
    Args:
        features: Engineered features
        ml_prediction: ML model prediction
        ml_confidence: ML model confidence
    
    Returns:
        (final_stress_type, final_confidence, validation_reason)
    """
    # Confidence threshold
    if ml_confidence < 0.45:
        return 'no_stress', 0.0, 'low_confidence'
    
    # Apply stress-specific rules
    if ml_prediction == 'moisture_stress':
        return validate_moisture_stress(features, ml_confidence)
    
    elif ml_prediction == 'heat_stress':
        return validate_heat_stress(features, ml_confidence)
    
    elif ml_prediction == 'waterlogging':
        return validate_waterlogging(features, ml_confidence)
    
    else:  # no_stress
        # Check if any stress indicator is critically high
        if features['moisture_stress'] > 0.8:
            return 'moisture_stress', 0.75, 'rule_override_moisture'
        
        if features['heat_stress'] > 0.8:
            return 'heat_stress', 0.75, 'rule_override_heat'
        
        if features['waterlogging'] > 0.8:
            return 'waterlogging', 0.75, 'rule_override_waterlogging'
        
        return 'no_stress', ml_confidence, 'validated_no_stress'
