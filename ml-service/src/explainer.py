"""
Explainability Module
Generate human-readable explanations for stress predictions
"""

from typing import Dict


def generate_explanation(
    stress_type: str,
    severity: str,
    features: Dict,
    confidence: float,
    validation_reason: str
) -> str:
    """
    Generate human-readable explanation for the prediction
    
    Args:
        stress_type: Predicted stress type
        severity: Severity level
        features: Engineered features
        confidence: Confidence score
        validation_reason: Validation reason from rule engine
    
    Returns:
        Human-readable explanation string
    """
    if stress_type == 'no_stress':
        return _explain_no_stress(features)
    
    elif stress_type == 'moisture_stress':
        return _explain_moisture_stress(features, severity, validation_reason)
    
    elif stress_type == 'heat_stress':
        return _explain_heat_stress(features, severity, validation_reason)
    
    elif stress_type == 'waterlogging':
        return _explain_waterlogging(features, severity, validation_reason)
    
    return "Stress detected based on current conditions."


def _explain_no_stress(features: Dict) -> str:
    """Explain why no stress is detected"""
    growth_stage = features['growth_stage']
    season = features['season']
    
    explanation = (
        f"Crop is currently in {growth_stage} stage with favorable conditions. "
        f"Weather parameters are within normal range for {season} season. "
        f"Continue regular monitoring and field management practices."
    )
    
    return explanation


def _explain_moisture_stress(features: Dict, severity: str, reason: str) -> str:
    """Explain moisture stress detection"""
    growth_stage = features['growth_stage']
    season = features['season']
    crop_type = features['crop_type']
    dry_days = features['dry_days_norm']
    rainfall = features['rolling_rainfall_norm']
    soil_type = features['soil_type']
    
    # Build explanation
    parts = []
    
    # Opening
    parts.append(
        f"Moisture stress detected in {crop_type} during {growth_stage} stage."
    )
    
    # Dry period
    if dry_days > 0.5:
        dry_days_approx = int(dry_days * 14)
        parts.append(
            f"Field has experienced approximately {dry_days_approx} consecutive dry days."
        )
    
    # Rainfall deficit
    if rainfall < 0.4:
        parts.append(
            f"Recent rainfall has been below normal levels for {season} season."
        )
    
    # Soil factor
    parts.append(
        f"Soil type ({soil_type}) has moderate water retention capacity."
    )
    
    # Critical stage warning
    if growth_stage in ['flowering', 'grain_filling']:
        parts.append(
            f"This is a critical growth stage - moisture stress can significantly impact yield."
        )
    
    # Seasonal context
    parts.append(
        f"Seasonal baseline applied: {season}."
    )
    
    return " ".join(parts)


def _explain_heat_stress(features: Dict, severity: str, reason: str) -> str:
    """Explain heat stress detection"""
    growth_stage = features['growth_stage']
    season = features['season']
    crop_type = features['crop_type']
    temp_norm = features['avg_temp_norm']
    temp_dev = features['temp_deviation_norm']
    
    # Estimate actual temperature
    estimated_temp = 15 + (temp_norm * 30)
    
    parts = []
    
    # Opening
    parts.append(
        f"Heat stress detected in {crop_type} during {growth_stage} stage."
    )
    
    # Temperature level
    parts.append(
        f"Current temperatures (approximately {estimated_temp:.1f}°C) are above optimal range."
    )
    
    # Temperature deviation
    if temp_dev > 0.6:
        parts.append(
            "Temperatures are significantly higher than historical averages for this period."
        )
    
    # Evapotranspiration risk
    parts.append(
        "High temperatures increase evapotranspiration, raising water demand."
    )
    
    # Critical stage warning
    if growth_stage in ['flowering', 'grain_filling']:
        parts.append(
            "Heat stress during this critical stage can cause flower abortion and reduce grain formation."
        )
    
    # Seasonal context
    parts.append(
        f"Seasonal baseline applied: {season}."
    )
    
    return " ".join(parts)


def _explain_waterlogging(features: Dict, severity: str, reason: str) -> str:
    """Explain waterlogging detection"""
    growth_stage = features['growth_stage']
    season = features['season']
    crop_type = features['crop_type']
    rainfall = features['rainfall_norm']
    rolling_rain = features['rolling_rainfall_norm']
    soil_type = features['soil_type']
    soil_retention = features['soil_retention']
    
    parts = []
    
    # Opening
    parts.append(
        f"Waterlogging risk detected in {crop_type} during {growth_stage} stage."
    )
    
    # Rainfall intensity
    if rolling_rain > 0.6:
        estimated_rainfall = int(rolling_rain * 200)
        parts.append(
            f"Cumulative rainfall over past 7 days (approximately {estimated_rainfall}mm) is above normal."
        )
    
    # Soil drainage
    if soil_retention > 0.35:
        parts.append(
            f"Soil type ({soil_type}) has high water retention, reducing drainage efficiency."
        )
    
    # Impact
    parts.append(
        "Excess water reduces soil oxygen levels, affecting root respiration and nutrient uptake."
    )
    
    # Critical stage warning
    if growth_stage in ['germination', 'vegetative', 'tillering']:
        parts.append(
            "Waterlogging during early growth stages can severely damage root systems."
        )
    
    # Seasonal context
    parts.append(
        f"Seasonal baseline applied: {season}."
    )
    
    return " ".join(parts)


def generate_advisory(stress_type: str, severity: str, features: Dict) -> str:
    """
    Generate actionable advisory based on stress type
    
    Args:
        stress_type: Type of stress
        severity: Severity level
        features: Engineered features
    
    Returns:
        Advisory message
    """
    if stress_type == 'no_stress':
        return "Continue regular field monitoring and standard crop management practices."
    
    elif stress_type == 'moisture_stress':
        if severity == 'high':
            return "Increase irrigation frequency by 30-40% immediately. Apply mulch to reduce evaporation. Monitor soil moisture daily."
        elif severity == 'medium':
            return "Increase irrigation frequency by 20%. Consider light irrigation at critical times. Monitor crop stress symptoms."
        else:
            return "Plan supplemental irrigation. Monitor weather forecast and soil moisture levels closely."
    
    elif stress_type == 'heat_stress':
        if severity == 'high':
            return "Increase irrigation to maintain soil moisture. Avoid field operations during peak heat hours. Consider protective measures for sensitive stages."
        elif severity == 'medium':
            return "Maintain adequate soil moisture through regular irrigation. Monitor crop canopy temperature. Avoid stress-inducing operations."
        else:
            return "Ensure adequate water supply. Monitor temperature trends and crop response."
    
    elif stress_type == 'waterlogging':
        if severity == 'high':
            return "Implement emergency drainage immediately. Avoid field operations to prevent soil compaction. Monitor for disease symptoms."
        elif severity == 'medium':
            return "Improve field drainage. Reduce irrigation. Allow soil to dry before next irrigation cycle."
        else:
            return "Monitor drainage conditions. Adjust irrigation schedule based on rainfall. Check soil moisture before irrigation."
    
    return "Monitor field conditions and adjust management practices accordingly."
