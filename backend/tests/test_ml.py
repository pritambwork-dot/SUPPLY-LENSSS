import pytest
import numpy as np
from ml.models.logistic_baseline import BaselineModel

def test_baseline_untrained():
    model = BaselineModel()
    assert model.is_trained == False
    score = model.predict_score(np.array([[1, 2, 3]]))
    assert score == 0.5  # Neutral fallback

def test_baseline_training():
    model = BaselineModel()
    X = np.array([[0, 0], [1, 1], [0, 1], [1, 0]])
    y = np.array([0, 1, 0, 1])
    
    model.train(X, y)
    assert model.is_trained == True
    
    score = model.predict_score(np.array([[1, 1]]))
    assert 0 <= score <= 1.0
