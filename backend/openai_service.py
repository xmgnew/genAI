import base64
import json
import os
from typing import Any, Dict, List, Type, TypeVar

from dotenv import load_dotenv
from fastapi import HTTPException
from openai import OpenAI
from pydantic import BaseModel

from backend.schemas import (
    AnalyzeFoodResponse,
    CompareMealsRequest,
    CompareMealsResponse,
    DailyNutritionRequest,
    DailyNutritionResponse,
)

load_dotenv()

MODEL_NAME = os.getenv("OPENAI_MODEL", "gpt-4.1")

T = TypeVar("T", bound=BaseModel)


NUTRITION_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "calories": {"type": "number"},
        "protein_g": {"type": "number"},
        "carbs_g": {"type": "number"},
        "fat_g": {"type": "number"},
        "fiber_g": {"type": "number"},
        "sugar_g": {"type": "number"},
        "sodium_mg": {"type": "number"},
    },
    "required": ["calories", "protein_g", "carbs_g", "fat_g", "fiber_g", "sugar_g", "sodium_mg"],
    "additionalProperties": False,
}


ANALYZE_FOOD_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "meal_name": {"type": "string"},
        "summary": {"type": "string"},
        "estimated_nutrition": NUTRITION_SCHEMA,
        "ingredients": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "estimated_amount": {"type": "string"},
                    "confidence": {"type": "number"},
                },
                "required": ["name", "estimated_amount", "confidence"],
                "additionalProperties": False,
            },
        },
        "health_signals": {"type": "array", "items": {"type": "string"}},
        "next_best_actions": {"type": "array", "items": {"type": "string"}},
        "confidence": {"type": "number"},
        "disclaimer": {"type": "string"},
    },
    "required": [
        "meal_name",
        "summary",
        "estimated_nutrition",
        "ingredients",
        "health_signals",
        "next_best_actions",
        "confidence",
        "disclaimer",
    ],
    "additionalProperties": False,
}


COMPARE_MEALS_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "winner": {"type": "string", "enum": ["meal_a", "meal_b", "tie"]},
        "verdict": {"type": "string"},
        "recommendation": {"type": "string"},
        "scorecard": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "category": {"type": "string"},
                    "meal_a": {"type": "string"},
                    "meal_b": {"type": "string"},
                    "winner": {"type": "string", "enum": ["meal_a", "meal_b", "tie"]},
                },
                "required": ["category", "meal_a", "meal_b", "winner"],
                "additionalProperties": False,
            },
        },
        "tradeoffs": {"type": "array", "items": {"type": "string"}},
        "disclaimer": {"type": "string"},
    },
    "required": ["winner", "verdict", "recommendation", "scorecard", "tradeoffs", "disclaimer"],
    "additionalProperties": False,
}


DAILY_NUTRITION_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "day_summary": {"type": "string"},
        "meals": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "meal_name": {"type": "string"},
                    "estimated_nutrition": NUTRITION_SCHEMA,
                    "takeaway": {"type": "string"},
                },
                "required": ["meal_name", "estimated_nutrition", "takeaway"],
                "additionalProperties": False,
            },
        },
        "total_estimated_nutrition": NUTRITION_SCHEMA,
        "highlights": {"type": "array", "items": {"type": "string"}},
        "gaps": {"type": "array", "items": {"type": "string"}},
        "action_plan": {"type": "array", "items": {"type": "string"}},
        "hydration_tip": {"type": "string"},
        "overall_score": {"type": "number"},
        "disclaimer": {"type": "string"},
    },
    "required": [
        "day_summary",
        "meals",
        "total_estimated_nutrition",
        "highlights",
        "gaps",
        "action_plan",
        "hydration_tip",
        "overall_score",
        "disclaimer",
    ],
    "additionalProperties": False,
}


SYSTEM_PROMPT = """
You are NutriLens, an AI nutrition decision copilot.
Return realistic nutritional estimates, not false precision.
If details are uncertain, acknowledge that uncertainty in the summary or disclaimer.
Do not provide medical diagnosis or claim certainty from a single image.
Keep guidance practical, concise, and consumer-friendly.
""".strip()


def _get_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not configured.")
    return OpenAI(api_key=api_key)


def image_bytes_to_data_url(raw_bytes: bytes, content_type: str) -> str:
    encoded = base64.b64encode(raw_bytes).decode("utf-8")
    return f"data:{content_type};base64,{encoded}"


def _structured_response(
    schema_name: str,
    schema: Dict[str, Any],
    user_content: List[Dict[str, Any]],
    response_model: Type[T],
) -> T:
    client = _get_client()

    try:
        response = client.responses.create(
            model=MODEL_NAME,
            instructions=SYSTEM_PROMPT,
            input=[{"role": "user", "content": user_content}],
            text={
                "format": {
                    "type": "json_schema",
                    "name": schema_name,
                    "schema": schema,
                    "strict": True,
                }
            },
        )
    except Exception as exc:  # pragma: no cover - network/runtime dependency
        raise HTTPException(status_code=502, detail=f"OpenAI request failed: {exc}") from exc

    try:
        payload = json.loads(response.output_text)
        return response_model.model_validate(payload)
    except Exception as exc:  # pragma: no cover - validation/runtime dependency
        raise HTTPException(status_code=502, detail=f"Invalid structured model output: {exc}") from exc


def analyze_food(image_data_url: str, notes: str, goal: str) -> AnalyzeFoodResponse:
    prompt = f"""
Analyze this food image and estimate what the meal likely contains.
Goal context: {goal or "No specific goal provided."}
Additional notes: {notes or "No extra notes provided."}

Return:
- a short meal name
- a concise summary
- estimated nutrition
- likely ingredients with estimated amounts
- health signals
- practical next actions
- overall confidence
- a disclaimer that values are estimates
""".strip()

    return _structured_response(
        schema_name="analyze_food_response",
        schema=ANALYZE_FOOD_SCHEMA,
        response_model=AnalyzeFoodResponse,
        user_content=[
            {"type": "input_text", "text": prompt},
            {"type": "input_image", "image_url": image_data_url},
        ],
    )


def compare_meals(request: CompareMealsRequest) -> CompareMealsResponse:
    prompt = f"""
Compare these two meal options for nutrition quality and practical fit.
Decision focus: {request.focus or "General healthy eating."}

Meal A:
Name: {request.meal_a.name}
Description: {request.meal_a.description}

Meal B:
Name: {request.meal_b.name}
Description: {request.meal_b.description}

Choose a winner only when the difference is meaningful. Otherwise return tie.
""".strip()

    return _structured_response(
        schema_name="compare_meals_response",
        schema=COMPARE_MEALS_SCHEMA,
        response_model=CompareMealsResponse,
        user_content=[{"type": "input_text", "text": prompt}],
    )


def daily_nutrition(request: DailyNutritionRequest) -> DailyNutritionResponse:
    meal_lines = []
    for meal in request.meals:
        meal_lines.append(
            f"- {meal.name} ({meal.time or 'time not provided'}): {meal.description}"
        )

    goals = request.goals.model_dump() if request.goals else {}

    prompt = f"""
Summarize this full day of eating and estimate the overall nutrition picture.
Date: {request.date or "Not provided"}
Goals: {json.dumps(goals)}
Meals:
{chr(10).join(meal_lines)}

Return per-meal takeaways, total estimated nutrition, highlights, gaps, an action plan, a hydration tip, and an overall score out of 100.
""".strip()

    return _structured_response(
        schema_name="daily_nutrition_response",
        schema=DAILY_NUTRITION_SCHEMA,
        response_model=DailyNutritionResponse,
        user_content=[{"type": "input_text", "text": prompt}],
    )
