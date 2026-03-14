import base64
import json
import logging
import os
from typing import Any, Callable, Dict, List, Type, TypeVar

from dotenv import load_dotenv
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
logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)
FallbackBuilder = Callable[[], Dict[str, Any]]


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
        "primary_risk_flag": {"type": "string"},
        "prevention_focus": {"type": "string"},
        "next_best_intervention": {"type": "string"},
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
        "primary_risk_flag",
        "prevention_focus",
        "next_best_intervention",
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
        raise RuntimeError("OPENAI_API_KEY is not configured.")
    return OpenAI(api_key=api_key)


def image_bytes_to_data_url(raw_bytes: bytes, content_type: str) -> str:
    encoded = base64.b64encode(raw_bytes).decode("utf-8")
    return f"data:{content_type};base64,{encoded}"


def _fallback_nutrition() -> Dict[str, float]:
    return {
        "calories": 400,
        "protein_g": 20,
        "carbs_g": 35,
        "fat_g": 15,
        "fiber_g": 5,
        "sugar_g": 6,
        "sodium_mg": 500,
    }


def _validate_fallback_response(
    response_model: Type[T],
    fallback_builder: FallbackBuilder,
    operation_name: str,
) -> T:
    fallback_data = fallback_builder()
    validated = response_model.model_validate(fallback_data)
    logger.info("Using fallback response for %s", operation_name)
    return validated


def _build_analyze_food_fallback() -> Dict[str, Any]:
    return {
        "meal_name": "Analysis unavailable",
        "summary": "NutriLens could not confidently analyze this food image, so this fallback estimate is intentionally minimal.",
        "estimated_nutrition": _fallback_nutrition(),
        "ingredients": [
            {
                "name": "Unknown meal",
                "estimated_amount": "Not available",
                "confidence": 0.1,
            }
        ],
        "health_signals": ["Image analysis was unavailable."],
        "next_best_actions": ["Retry with a clearer image or add meal details in notes."],
        "confidence": 0.1,
        "disclaimer": "Fallback response. Nutrition values are unavailable and shown as zeros.",
    }


def _build_compare_meals_fallback(request: CompareMealsRequest) -> Dict[str, Any]:
    meal_a_name = request.meal_a.name or "Meal A"
    meal_b_name = request.meal_b.name or "Meal B"
    return {
        "winner": "tie",
        "verdict": "Both meals are treated as a tie because the live comparison was unavailable.",
        "recommendation": f"Use the meal descriptions for a manual check between {meal_a_name} and {meal_b_name}.",
        "scorecard": [
    {
        "category": "Calories",
        "meal_a": "Estimate unavailable",
        "meal_b": "Estimate unavailable",
        "winner": "tie",
    },
    {
        "category": "Protein",
        "meal_a": "Estimate unavailable",
        "meal_b": "Estimate unavailable",
        "winner": "tie",
    },
    {
        "category": "Fiber",
        "meal_a": "Estimate unavailable",
        "meal_b": "Estimate unavailable",
        "winner": "tie",
    },
    {
        "category": "Overall balance",
        "meal_a": "Manual review suggested",
        "meal_b": "Manual review suggested",
        "winner": "tie",
    }
],
        "tradeoffs": ["Comparison fallback used. Re-run for a richer breakdown."],
        "disclaimer": "Fallback response. This comparison is a neutral placeholder.",
    }


def _build_daily_nutrition_fallback(request: DailyNutritionRequest) -> Dict[str, Any]:
    meals = request.meals or []
    fallback_meals = [
        {
            "meal_name": meal.name,
            "estimated_nutrition": _fallback_nutrition(),
            "takeaway": "Fallback summary used for this meal.",
        }
        for meal in meals
    ]

    return {
        "day_summary": "NutriLens could not generate the full daily summary, so this fallback keeps the dashboard stable.",
        "primary_risk_flag": "Monitoring gap",
        "prevention_focus": "Re-establish a consistent view of meal quality and portion balance.",
        "next_best_intervention": "Retry the summary and log the next meal with clearer detail.",
        "meals": fallback_meals,
        "total_estimated_nutrition": _fallback_nutrition(),
        "highlights": ["Meals were captured, but live analysis was unavailable."],
        "gaps": ["Nutrition totals could not be estimated reliably."],
        "action_plan": ["Retry the summary or add clearer meal details."],
        "hydration_tip": "Use water intake as a simple next step while analysis is unavailable.",
        "overall_score": 65,
        "disclaimer": "Fallback response. Daily totals are unavailable and shown as zeros.",
    }


def _structured_response(
    operation_name: str,
    schema_name: str,
    schema: Dict[str, Any],
    user_content: List[Dict[str, Any]],
    response_model: Type[T],
    fallback_builder: FallbackBuilder,
) -> T:
    try:
        client = _get_client()
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
        logger.warning("OpenAI request failed for %s: %s", operation_name, exc, exc_info=True)
        return _validate_fallback_response(response_model, fallback_builder, operation_name)

    try:
        payload = json.loads(response.output_text)
    except Exception as exc:  # pragma: no cover - parsing/runtime dependency
        logger.warning("JSON parsing failed for %s: %s", operation_name, exc, exc_info=True)
        return _validate_fallback_response(response_model, fallback_builder, operation_name)

    try:
        return response_model.model_validate(payload)
    except Exception as exc:  # pragma: no cover - validation/runtime dependency
        logger.warning("Schema validation failed for %s: %s", operation_name, exc, exc_info=True)
        return _validate_fallback_response(response_model, fallback_builder, operation_name)


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
        operation_name="analyze_food",
        schema_name="analyze_food_response",
        schema=ANALYZE_FOOD_SCHEMA,
        response_model=AnalyzeFoodResponse,
        fallback_builder=_build_analyze_food_fallback,
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
        operation_name="compare_meals",
        schema_name="compare_meals_response",
        schema=COMPARE_MEALS_SCHEMA,
        response_model=CompareMealsResponse,
        fallback_builder=lambda: _build_compare_meals_fallback(request),
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
Summarize this full day of eating as a preventive nutrition monitoring update.
Date: {request.date or "Not provided"}
Goals: {json.dumps(goals)}
Meals:
{chr(10).join(meal_lines)}

Return concise, frontend-friendly output that feels like an agentic AI nutrition copilot.
Frame the response around monitoring, prevention, and the single next intervention a user should take.
Do not use diagnosis language, disease claims, or urgent medical wording.

Return:
- a short day summary
- one primary_risk_flag describing the main nutrition pattern to watch
- one prevention_focus describing the best preventive emphasis for the next 24 hours
- one next_best_intervention describing the single most useful next step
- per-meal takeaways
- total estimated nutrition
- highlights
- gaps
- a short action plan
- a hydration tip
- an overall score out of 100
""".strip()

    return _structured_response(
        operation_name="daily_nutrition",
        schema_name="daily_nutrition_response",
        schema=DAILY_NUTRITION_SCHEMA,
        response_model=DailyNutritionResponse,
        fallback_builder=lambda: _build_daily_nutrition_fallback(request),
        user_content=[{"type": "input_text", "text": prompt}],
    )
