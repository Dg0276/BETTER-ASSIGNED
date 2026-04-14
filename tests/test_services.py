import pytest
from backend.services import ScoringService, TaskService

def test_balanced_strategy():
    """Test standard balanced calculation: (impact + effort) / 2"""
    # 5 + 5 / 2 = 5.0
    assert ScoringService.balanced(5, 5) == 5.0
    # 1 + 5 / 2 = 3.0
    assert ScoringService.balanced(1, 5) == 3.0
    # 3 + 2 / 2 = 2.5
    assert ScoringService.balanced(3, 2) == 2.5

def test_urgent_strategy():
    """Test urgent calculation: (Impact * 2) - Effort"""
    # High impact, low effort
    assert ScoringService.urgent(5, 1) == 9.0
    # Low impact, high effort
    assert ScoringService.urgent(1, 5) == -3.0

def test_calculate_dispatch():
    """Test the Strategy Pattern dispatcher"""
    assert ScoringService.calculate('balanced', 4, 4) == 4.0
    assert ScoringService.calculate('urgent', 4, 4) == 4.0

def test_prepare_task_data():
    """Test the complete layer from validation dictionary to database prep"""
    input_data = {
        "title": "Test Task",
        "description": "Test Description",
        "impact": 5,
        "effort": 1,
        "strategy": "urgent"
    }
    
    result = TaskService.prepare_task_data(input_data)
    
    assert result["title"] == "Test Task"
    assert result["impact"] == 5
    assert result["effort"] == 1
    assert result["strategy"] == "urgent"
    # Result should have the dynamically calculated score injected
    assert result["priority_score"] == 9.0
