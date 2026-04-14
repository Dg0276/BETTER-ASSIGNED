"""
Services layer implementing the Strategy Pattern for dynamic task scoring.
"""
from typing import Dict, Any


class ScoringService:
    """
    Strategy Pattern: dispatches to the correct scoring formula
    based on the chosen strategy name.
    """

    @staticmethod
    def balanced(impact: int, effort: int) -> float:
        """Balanced strategy: (Impact + Effort) / 2"""
        return round((impact + effort) / 2, 2)

    @staticmethod
    def urgent(impact: int, effort: int) -> float:
        """Urgent strategy: Impact * 2 - Effort"""
        return round(impact * 2 - effort, 2)

    @staticmethod
    def roi(impact: int, effort: int) -> float:
        """ROI strategy: Impact / Effort — maximises return on investment"""
        return round(impact / effort, 2)

    @classmethod
    def calculate(cls, strategy: str, impact: int, effort: int) -> float:
        """
        Dispatch to the correct strategy method.
        Raises ValueError if strategy is unknown (should be caught by Pydantic first).
        """
        strategies = {
            'balanced': cls.balanced,
            'urgent': cls.urgent,
            'roi': cls.roi,
        }
        fn = strategies.get(strategy)
        if fn is None:
            raise ValueError(f"Unknown scoring strategy: '{strategy}'")
        return fn(impact, effort)


class TaskService:
    """Handles task data preparation before database insertion."""

    @staticmethod
    def prepare_task_data(task_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Given validated task data, computes the priority_score using
        the selected strategy and returns a dict ready for DB insertion.
        """
        impact = task_data['impact']
        effort = task_data['effort']
        strategy = task_data.get('strategy', 'balanced')

        priority_score = ScoringService.calculate(strategy, impact, effort)

        processed = task_data.copy()
        processed['priority_score'] = priority_score
        return processed
