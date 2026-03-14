import imghdr
import os

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from backend.openai_service import analyze_food, compare_meals, daily_nutrition, image_bytes_to_data_url
from backend.schemas import AnalyzeFoodResponse, CompareMealsRequest, CompareMealsResponse, DailyNutritionRequest, DailyNutritionResponse


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
    goal: str = Form(default=""),
):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="The uploaded file must be an image.")

    raw_bytes = await image.read()
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")

    sniffed_type = imghdr.what(None, h=raw_bytes)
    mime_type = image.content_type or "image/jpeg"

    if not sniffed_type:
        raise HTTPException(status_code=400, detail="Unsupported or invalid image file.")

    if "/" not in mime_type:
        mime_type = f"image/{sniffed_type}"

    return analyze_food(image_bytes_to_data_url(raw_bytes, mime_type), notes, goal)


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
