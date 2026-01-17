"""
ML Model Module
Lightweight ML using Random Forest for stress prediction
"""

import numpy as np
from typing import Dict, Tuple
from sklearn.ensemble import RandomForestClassifier


class StressMLModel:
    """
    Random Forest model for crop stress prediction
    
    This is a pre-trained model using domain knowledge.
    In production, train on historical data with labels.
    """
    
    def __init__(self):
        self.model = None
        self.feature_names = [
            'days_after_sowing',
            'season_encoded',
            'soil_retention',
            'avg_temp_norm',
            'rainfall_norm',
            'rolling_rainfall_norm',
            'dry_days_norm',
            'temp_deviation_norm',
            'moisture_stress',
            'heat_stress',
            'waterlogging'
        ]
        
        # Initialize with rule-based weights (simulating trained model)
        self._initialize_model()
    
    def _initialize_model(self):
        """
        Initialize model with synthetic training data
        This simulates a pre-trained model based on agronomic rules
        """
        # Create synthetic training data based on domain knowledge
        np.random.seed(42)
        n_samples = 1000
        
        X_train = []
        y_train = []
        
        for _ in range(n_samples):
            # Generate synthetic features
            days = np.random.randint(0, 150)
            season = np.random.randint(0, 3)
            soil = np.random.uniform(0.15, 0.45)
            temp = np.random.uniform(0, 1)
            rain = np.random.uniform(0, 1)
            roll_rain = np.random.uniform(0, 1)
            dry_days = np.random.uniform(0, 1)
            temp_dev = np.random.uniform(0, 1)
            moisture_ind = np.random.uniform(0, 1)
            heat_ind = np.random.uniform(0, 1)
            water_ind = np.random.uniform(0, 1)
            
            features = [
                days, season, soil, temp, rain, roll_rain,
                dry_days, temp_dev, moisture_ind, heat_ind, water_ind
            ]
            
            # Label based on rules
            if moisture_ind > 0.6 and dry_days > 0.5:
                label = 0  # moisture_stress
            elif heat_ind > 0.7 and temp_dev > 0.6:
                label = 1  # heat_stress
            elif water_ind > 0.7 and roll_rain > 0.7:
                label = 2  # waterlogging
            else:
                label = 3  # no_stress
            
            X_train.append(features)
            y_train.append(label)
        
        # Train Random Forest
        self.model = RandomForestClassifier(
            n_estimators=50,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        )
        self.model.fit(X_train, y_train)
    
    def predict(self, features: Dict[str, float]) -> Tuple[str, float]:
        """
        Predict stress type and confidence
        
        Args:
            features: Engineered features
        
        Returns:
            (stress_type, confidence_score)
        """
        # Extract feature vector
        X = np.array([[
            features['days_after_sowing'],
            features['season_encoded'],
            features['soil_retention'],
            features['avg_temp_norm'],
            features['rainfall_norm'],
            features['rolling_rainfall_norm'],
            features['dry_days_norm'],
            features['temp_deviation_norm'],
            features['moisture_stress'],
            features['heat_stress'],
            features['waterlogging']
        ]])
        
        # Get prediction probabilities
        probs = self.model.predict_proba(X)[0]
        
        # Map to stress types
        stress_types = ['moisture_stress', 'heat_stress', 'waterlogging', 'no_stress']
        
        # Get top prediction
        max_idx = np.argmax(probs)
        stress_type = stress_types[max_idx]
        confidence = float(probs[max_idx])
        
        return stress_type, confidence
    
    def get_feature_importance(self) -> Dict[str, float]:
        """
        Get feature importance scores
        
        Returns:
            Feature importance dictionary
        """
        importances = self.model.feature_importances_
        return dict(zip(self.feature_names, importances))
