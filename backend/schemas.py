from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class NutritionEstimate(BaseModel):
    calories: float = Field(..., ge=0)
    protein_g: float = Field(..., ge=0)
    carbs_g: float = Field(..., ge=0)
    fat_g: float = Field(..., ge=0)
    fiber_g: float = Field(..., ge=0)
    sugar_g: float = Field(..., ge=0)
    sodium_mg: float = Field(..., ge=0)


class IngredientEstimate(BaseModel):
    name: str
    estimated_amount: str
    confidence: float = Field(..., ge=0, le=1)


class AnalyzeFoodResponse(BaseModel):
    meal_name: str
    summary: str
    estimated_nutrition: NutritionEstimate
    ingredients: List[IngredientEstimate]
    health_signals: List[str]
    next_best_actions: List[str]
    confidence: float = Field(..., ge=0, le=1)
    disclaimer: str


class MealInput(BaseModel):
    name: str
    description: str


class CompareMealsRequest(BaseModel):
    meal_a: MealInput
    meal_b: MealInput
    focus: Optional[str] = None


class ScorecardItem(BaseModel):
    category: str
    meal_a: str
    meal_b: str
    winner: Literal["meal_a", "meal_b", "tie"]


class CompareMealsResponse(BaseModel):
    winner: Literal["meal_a", "meal_b", "tie"]
    verdict: str
    recommendation: str
    scorecard: List[ScorecardItem]
    tradeoffs: List[str]
    disclaimer: str


class DailyMealInput(BaseModel):
    name: str
    description: str
    time: Optional[str] = None


class DailyGoals(BaseModel):
    focus: Optional[str] = None
    calorie_target: Optional[float] = Field(default=None, ge=0)
    protein_target_g: Optional[float] = Field(default=None, ge=0)


class DailyNutritionRequest(BaseModel):
    date: Optional[str] = None
    meals: List[DailyMealInput]
    goals: Optional[DailyGoals] = None


class DailyMealEstimate(BaseModel):
    meal_name: str
    estimated_nutrition: NutritionEstimate
    takeaway: str


class DailyNutritionResponse(BaseModel):
    day_summary: str
    primary_risk_flag: str
    prevention_focus: str
    next_best_intervention: str
    meals: List[DailyMealEstimate]
    total_estimated_nutrition: NutritionEstimate
    highlights: List[str]
    gaps: List[str]
    action_plan: List[str]
    hydration_tip: str
    overall_score: float = Field(..., ge=0, le=100)
    disclaimer: str
