"""
Feature Engineering Module
Compute features from raw crop and weather data
"""

from datetime import datetime, timedelta
import numpy as np
from typing import Dict, Any


# Growth stage mappings by crop type (days after sowing ranges)
GROWTH_STAGES = {
    'wheat': {
        (0, 21): 'germination',
        (22, 45): 'tillering',
        (46, 75): 'stem_elongation',
        (76, 105): 'flowering',
        (106, 135): 'grain_filling',
        (136, 150): 'maturity'
    },
    'rice': {
        (0, 20): 'germination',
        (21, 40): 'tillering',
        (41, 65): 'stem_elongation',
        (66, 95): 'flowering',
        (96, 120): 'grain_filling',
        (121, 140): 'maturity'
    },
    'maize': {
        (0, 15): 'germination',
        (16, 35): 'vegetative',
        (36, 55): 'flowering',
        (56, 85): 'grain_filling',
        (86, 110): 'maturity'
    },
    'cotton': {
        (0, 25): 'germination',
        (26, 60): 'vegetative',
        (61, 95): 'flowering',
        (96, 145): 'boll_development',
        (146, 180): 'maturity'
    }
}

# Season encoding
SEASON_ENCODING = {
    'monsoon': 0,
    'kharif': 0,
    'winter': 1,
    'rabi': 1,
    'summer': 2,
    'zaid': 2
}

# Soil type water retention factors
SOIL_WATER_RETENTION = {
    'clay': 0.45,
    'clay_loam': 0.40,
    'loam': 0.35,
    'sandy_loam': 0.25,
    'sandy': 0.15,
    'silt': 0.38,
    'silt_loam': 0.35
}


def compute_days_after_sowing(sowing_date: str) -> int:
    """
    Calculate days after sowing from sowing date
    
    Args:
        sowing_date: ISO format date string (YYYY-MM-DD)
    
    Returns:
        Number of days after sowing
    """
    sowing = datetime.fromisoformat(sowing_date.replace('Z', '+00:00'))
    now = datetime.now()
    delta = now - sowing
    return max(0, delta.days)


def get_growth_stage(crop_type: str, days_after_sowing: int) -> str:
    """
    Determine growth stage based on crop type and DAS
    
    Args:
        crop_type: Type of crop (wheat, rice, maize, cotton)
        days_after_sowing: Days since sowing
    
    Returns:
        Growth stage name
    """
    crop_type = crop_type.lower()
    
    if crop_type not in GROWTH_STAGES:
        return 'unknown'
    
    stages = GROWTH_STAGES[crop_type]
    
    for (min_days, max_days), stage in stages.items():
        if min_days <= days_after_sowing <= max_days:
            return stage
    
    return 'post_maturity'


def encode_season(season: str) -> int:
    """
    Encode season to numeric value
    
    Args:
        season: Season name
    
    Returns:
        Encoded season value (0, 1, or 2)
    """
    season_lower = season.lower()
    return SEASON_ENCODING.get(season_lower, 0)


def get_soil_retention_factor(soil_type: str) -> float:
    """
    Get water retention factor for soil type
    
    Args:
        soil_type: Type of soil
    
    Returns:
        Water retention factor (0-1)
    """
    soil_lower = soil_type.lower().replace(' ', '_')
    return SOIL_WATER_RETENTION.get(soil_lower, 0.30)


def compute_weather_features(weather_data: Dict[str, Any]) -> Dict[str, float]:
    """
    Compute normalized weather features
    
    Args:
        weather_data: Dict with weather parameters
    
    Returns:
        Normalized weather features
    """
    # Extract raw features
    avg_temp = weather_data.get('avg_temp', 25.0)
    rainfall = weather_data.get('rainfall', 0.0)
    rolling_7day_rainfall = weather_data.get('rolling_7day_rainfall', 0.0)
    consecutive_dry_days = weather_data.get('consecutive_dry_days', 0)
    temp_deviation = weather_data.get('temp_deviation_from_normal', 0.0)
    
    # Normalize features (using reasonable ranges)
    normalized = {
        'avg_temp_norm': np.clip((avg_temp - 15) / 30, 0, 1),  # 15-45°C range
        'rainfall_norm': np.clip(rainfall / 100, 0, 1),  # 0-100mm range
        'rolling_rainfall_norm': np.clip(rolling_7day_rainfall / 200, 0, 1),  # 0-200mm range
        'dry_days_norm': np.clip(consecutive_dry_days / 14, 0, 1),  # 0-14 days range
        'temp_deviation_norm': np.clip((temp_deviation + 10) / 20, 0, 1)  # -10 to +10°C range
    }
    
    return normalized


def compute_stress_indicators(
    crop_type: str,
    growth_stage: str,
    weather_features: Dict[str, float],
    soil_retention: float
) -> Dict[str, float]:
    """
    Compute stress indicator scores
    
    Args:
        crop_type: Type of crop
        growth_stage: Current growth stage
        weather_features: Normalized weather features
        soil_retention: Soil water retention factor
    
    Returns:
        Stress indicator scores
    """
    indicators = {}
    
    # Moisture stress indicator
    dry_days = weather_features['dry_days_norm']
    rainfall_deficit = 1.0 - weather_features['rolling_rainfall_norm']
    soil_factor = 1.0 - soil_retention
    
    indicators['moisture_stress'] = np.clip(
        (dry_days * 0.4 + rainfall_deficit * 0.4 + soil_factor * 0.2),
        0, 1
    )
    
    # Heat stress indicator
    temp_level = weather_features['avg_temp_norm']
    temp_deviation = weather_features['temp_deviation_norm']
    
    indicators['heat_stress'] = np.clip(
        (temp_level * 0.6 + temp_deviation * 0.4),
        0, 1
    )
    
    # Waterlogging indicator
    recent_rainfall = weather_features['rainfall_norm']
    rolling_rainfall = weather_features['rolling_rainfall_norm']
    drainage_factor = soil_retention  # Clay retains more water
    
    indicators['waterlogging'] = np.clip(
        (recent_rainfall * 0.3 + rolling_rainfall * 0.5 + drainage_factor * 0.2),
        0, 1
    )
    
    return indicators


def engineer_features(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main feature engineering pipeline
    
    Args:
        input_data: Raw input data
    
    Returns:
        Engineered features ready for ML model
    """
    # Extract inputs
    crop_type = input_data.get('crop_type', 'wheat')
    sowing_date = input_data.get('sowing_date')
    soil_type = input_data.get('soil_type', 'loam')
    season = input_data.get('season', 'monsoon')
    weather_data = input_data.get('weather', {})
    
    # Compute derived features
    days_after_sowing = compute_days_after_sowing(sowing_date)
    growth_stage = get_growth_stage(crop_type, days_after_sowing)
    season_encoded = encode_season(season)
    soil_retention = get_soil_retention_factor(soil_type)
    
    # Compute weather features
    weather_features = compute_weather_features(weather_data)
    
    # Compute stress indicators
    stress_indicators = compute_stress_indicators(
        crop_type,
        growth_stage,
        weather_features,
        soil_retention
    )
    
    # Package features
    features = {
        'crop_type': crop_type,
        'days_after_sowing': days_after_sowing,
        'growth_stage': growth_stage,
        'season_encoded': season_encoded,
        'season': season,
        'soil_type': soil_type,
        'soil_retention': soil_retention,
        **weather_features,
        **stress_indicators
    }
    
    return features
