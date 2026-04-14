from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, description="Title of the task")
    description: Optional[str] = Field(None, description="Detailed description")
    impact: int = Field(..., ge=1, le=5, description="Impact score from 1 to 5")
    effort: int = Field(..., ge=1, le=5, description="Effort score from 1 to 5")
    strategy: Literal['balanced', 'urgent', 'roi'] = Field(
        'balanced',
        description="Scoring strategy: 'balanced', 'urgent', or 'roi'"
    )

    @field_validator('impact', 'effort')
    @classmethod
    def validate_score_range(cls, v: int) -> int:
        if not (1 <= v <= 5):
            raise ValueError('Score must be between 1 and 5')
        return v


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    impact: int
    effort: int
    priority_score: float
    strategy: str
    is_done: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ActivityLogResponse(BaseModel):
    id: int
    task_id: int
    action: str
    details: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True
