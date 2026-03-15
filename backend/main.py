import filetype
import os

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from backend.openai_service import analyze_food, compare_meals, daily_nutrition, image_bytes_to_data_url
from backend.schemas import (
    AnalyzeFoodResponse,
    CompareMealsRequest,
    CompareMealsResponse,
    DailyNutritionRequest,
    DailyNutritionResponse,
)


app = FastAPI(
    title="NutriLens API",
    version="0.1.0",
    description="FastAPI backend for NutriLens nutrition analysis workflows.",
)

allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/analyze-food", response_model=AnalyzeFoodResponse)
async def analyze_food_route(
    image: UploadFile = File(...),
    notes: str = Form(default=""),
    goal: str = Form(default="general_wellness"),
    height_cm: float | None = Form(default=None),
    weight_kg: float | None = Form(default=None),
    age_range: str | None = Form(default=None),
    activity_level: str | None = Form(default=None),
):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="The uploaded file must be an image.")

    raw_bytes = await image.read()
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")

    kind = filetype.guess(raw_bytes)

    if kind is None or not kind.mime.startswith("image/"):
        raise HTTPException(status_code=400, detail="Unsupported or invalid image file.")

    mime_type = kind.mime

    user_profile = {
        key: value
        for key, value in {
            "height_cm": height_cm,
            "weight_kg": weight_kg,
            "age_range": age_range,
            "activity_level": activity_level,
        }.items()
        if value is not None and value != ""
    }

    return analyze_food(
        image_bytes_to_data_url(raw_bytes, mime_type),
        notes,
        goal,
        user_profile or None,
    )


@app.post("/compare-meals", response_model=CompareMealsResponse)
async def compare_meals_route(request: CompareMealsRequest):
    if not request.meal_a.description.strip() or not request.meal_b.description.strip():
        raise HTTPException(status_code=400, detail="Both meal descriptions are required.")

    return compare_meals(request)


@app.post("/daily-nutrition", response_model=DailyNutritionResponse)
async def daily_nutrition_route(request: DailyNutritionRequest):
    if not request.meals:
        raise HTTPException(status_code=400, detail="At least one meal is required.")

    return daily_nutrition(request)
