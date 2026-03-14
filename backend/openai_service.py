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
    UserProfile,
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
You are NutriLens, an agentic AI nutrition copilot for preventive physical health.
Return realistic nutritional estimates, not false precision.
If details are uncertain, acknowledge that uncertainty in the summary or disclaimer.
Use the user's health goal and optional profile to personalize nutrition guidance.
Do not provide medical diagnosis or claim certainty from a single image.
Keep guidance practical, concise, consumer-friendly, and frontend-friendly.
""".strip()


def _get_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured.")
    return OpenAI(api_key=api_key)


def image_bytes_to_data_url(raw_bytes: bytes, content_type: str) -> str:
    encoded = base64.b64encode(raw_bytes).decode("utf-8")
    return f"data:{content_type};base64,{encoded}"


def _normalize_user_profile(user_profile: UserProfile | Dict[str, Any] | None) -> UserProfile | None:
    if user_profile is None:
        return None
    if isinstance(user_profile, UserProfile):
        return user_profile
    return UserProfile.model_validate(user_profile)


def _build_user_context(goal: str, user_profile: UserProfile | Dict[str, Any] | None) -> str:
    normalized_goal = (goal or "general_wellness").replace("_", " ")
    profile = _normalize_user_profile(user_profile)

    profile_parts = []
    if profile:
        if profile.age_range:
            profile_parts.append(f"age range {profile.age_range}")
        if profile.activity_level:
            profile_parts.append(f"activity level {profile.activity_level}")
        if profile.height_cm is not None:
            profile_parts.append(f"height {profile.height_cm:g} cm")
        if profile.weight_kg is not None:
            profile_parts.append(f"weight {profile.weight_kg:g} kg")

    if profile_parts:
        return (
            f"Personalization context: goal is {normalized_goal}. "
            f"Profile signals: {', '.join(profile_parts)}. "
            "Tailor guidance to this context while staying general, concise, and non-diagnostic."
        )

    return (
        f"Personalization context: goal is {normalized_goal}. "
        "Tailor guidance to this goal while staying general, concise, and non-diagnostic."
    )


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
        "disclaimer": "Fallback response. Nutrition values are rough placeholders for demo stability."
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
        "disclaimer": "Fallback response. Daily totals are rough placeholders for demo stability.",
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


def analyze_food(
    image_data_url: str,
    notes: str,
    goal: str,
    user_profile: UserProfile | Dict[str, Any] | None = None,
) -> AnalyzeFoodResponse:
    user_context = _build_user_context(goal, user_profile)
    prompt = f"""
    Analyze this food image for a preventive health nutrition demo.

    {user_context}
    Additional notes: {notes or "No extra notes provided."}

    Focus on how this meal may support or weaken everyday physical health.

    Rules:
    - meal_name: 2 to 5 words only
    - summary: 1 sentence, maximum 18 words
    - estimated_nutrition: realistic rough estimates only
    - ingredients: maximum 4 items
    - each ingredient estimated_amount: short phrase only
    - health_signals: exactly 2 short strings
    - next_best_actions: exactly 2 short action strings
    - confidence: number from 0 to 1
    - disclaimer: 1 short sentence only
    - keep all text concise and frontend-friendly
    - do not use markdown
    - do not diagnose disease
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
    user_context = _build_user_context(request.goal, request.user_profile)
    prompt = f"""
    Compare these two meal options for preventive nutrition quality and everyday physical health.
    {user_context}
    Decision focus: {request.focus or "General healthy eating."}

    Meal A:
    Name: {request.meal_a.name}
    Description: {request.meal_a.description}

    Meal B:
    Name: {request.meal_b.name}
    Description: {request.meal_b.description}

    Choose a winner only when the difference is meaningful. Otherwise return tie.

    Rules:
    - verdict: 1 sentence, maximum 20 words
    - recommendation: 1 sentence, maximum 20 words
    - scorecard: exactly 4 categories
    - each scorecard field should be short and UI-friendly
    - tradeoffs: exactly 2 short strings
    - disclaimer: 1 short sentence only
    - focus on practical health improvement and nutrition balance
    - keep all text concise and frontend-friendly
    - do not use markdown
    - do not diagnose disease
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
    user_context = _build_user_context(request.goal, request.user_profile)

    prompt = f"""
    You are NutriLens, an agentic AI nutrition copilot for preventive physical health.

    Summarize this full day of eating as a nutrition monitoring and prevention report.
    Focus on helping the user improve physical health through better daily food decisions.
    {user_context}

    Date: {request.date or "Not provided"}
    Goals: {json.dumps(goals)}
    Meals:
    {chr(10).join(meal_lines)}

    Rules:
    - day_summary: 1 sentence, maximum 20 words
    - meals: include one takeaway per meal, each takeaway max 12 words
    - total_estimated_nutrition: realistic rough estimates only
    - highlights: exactly 2 short strings
    - gaps: exactly 2 short strings
    - primary_risk_flag: 1 short string
    - prevention_focus: 1 short string
    - next_best_intervention: 1 short actionable sentence
    - action_plan: exactly 2 short action strings
    - hydration_tip: 1 short sentence
    - overall_score: integer from 1 to 100
    - disclaimer: 1 short sentence only
    - keep all text concise, practical, and frontend-friendly
    - do not diagnose disease
    - focus on prevention, nutrition balance, and everyday health improvement
    """.strip()

    return _structured_response(
        operation_name="daily_nutrition",
        schema_name="daily_nutrition_response",
        schema=DAILY_NUTRITION_SCHEMA,
        response_model=DailyNutritionResponse,
        fallback_builder=lambda: _build_daily_nutrition_fallback(request),
        user_content=[{"type": "input_text", "text": prompt}],
    )
