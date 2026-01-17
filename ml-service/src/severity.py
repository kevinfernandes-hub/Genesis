"""
Severity Module
Compute stress severity levels
"""

from typing import Tuple


def compute_severity(
    stress_type: str,
    confidence: float,
    features: dict
) -> Tuple[str, str]:
    """
    Compute severity level and color code
    
    Args:
        stress_type: Type of stress
        confidence: Confidence score (0-1)
        features: Engineered features
    
    Returns:
        (severity_level, severity_color)
    """
    if stress_type == 'no_stress':
        return 'none', 'green'
    
    # Base severity from confidence
    if confidence >= 0.80:
        base_severity = 'high'
    elif confidence >= 0.60:
        base_severity = 'medium'
    else:
        base_severity = 'low'
    
    # Adjust for growth stage
    growth_stage = features.get('growth_stage', '')
    crop_type = features.get('crop_type', '')
    
    # Critical stages increase severity
    critical_stages = ['flowering', 'grain_filling', 'boll_development']
    if growth_stage in critical_stages:
        if base_severity == 'medium':
            base_severity = 'high'
        elif base_severity == 'low':
            base_severity = 'medium'
    
    # Adjust for soil type (moisture stress only)
    if stress_type == 'moisture_stress':
        soil_retention = features.get('soil_retention', 0.30)
        if soil_retention < 0.20:  # Sandy soil - worse moisture retention
            if base_severity == 'medium':
                base_severity = 'high'
    
    # Adjust for season
    season = features.get('season', '').lower()
    if stress_type == 'heat_stress' and season == 'summer':
        if base_severity == 'medium':
            base_severity = 'high'
    
    # Map severity to colors
    color_map = {
        'low': 'yellow',
        'medium': 'amber',
        'high': 'red'
    }
    
    return base_severity, color_map.get(base_severity, 'gray')


def get_severity_thresholds(stress_type: str) -> dict:
    """
    Get threshold values for different severity levels
    
    Args:
        stress_type: Type of stress
    
    Returns:
        Dictionary of thresholds
    """
    thresholds = {
        'moisture_stress': {
            'low': {'confidence': 0.45, 'indicator': 0.50},
            'medium': {'confidence': 0.60, 'indicator': 0.65},
            'high': {'confidence': 0.80, 'indicator': 0.80}
        },
        'heat_stress': {
            'low': {'confidence': 0.45, 'indicator': 0.55},
            'medium': {'confidence': 0.60, 'indicator': 0.70},
            'high': {'confidence': 0.80, 'indicator': 0.85}
        },
        'waterlogging': {
            'low': {'confidence': 0.45, 'indicator': 0.50},
            'medium': {'confidence': 0.60, 'indicator': 0.65},
            'high': {'confidence': 0.80, 'indicator': 0.80}
        }
    }
    
    return thresholds.get(stress_type, {})
