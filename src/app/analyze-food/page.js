"use client";

import { useEffect, useMemo, useState } from "react";
import { postForm } from "@/lib/api";
import { PageIntro } from "@/components/page-intro";
import { formatNutritionLabel, getMetricVisualState } from "@/lib/nutrition-metrics";
import { loadUserProfile } from "@/lib/user-profile";

const initialState = {
  notes: "",
  mealType: "",
};

const MEAL_TYPE_OPTIONS = [
  { value: "", label: "Select meal type" },
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

function getPersonalizedDailyValues(profile) {
  const weightKg = Number(profile?.weight_kg);
  const activity = profile?.activity_level;
  const goal = profile?.goal;
  const comorbidities = profile?.comorbidities || [];

  let values = {
    calories: 2000,
    protein_g: 50,
    carbs_g: 275,
    fat_g: 75,
    fiber_g: 28,
    sugar_g: 100,
    sodium_mg: 2300,
    saturated_fat_g: 20,
  };

  if (!Number.isNaN(weightKg) && weightKg > 0) {
    let proteinPerKg = 0.8;

    if (goal === "weight_management") proteinPerKg = 1.0;
    if (activity === "active_daily") proteinPerKg = Math.max(proteinPerKg, 1.2);
    if (activity === "very_active_daily") proteinPerKg = Math.max(proteinPerKg, 1.4);
    if (goal === "muscle_gain") proteinPerKg = Math.max(proteinPerKg, 1.6);

    values.protein_g = Math.round(weightKg * proteinPerKg);
  }

  switch (activity) {
    case "sedentary":
      values.calories -= 200;
      values.carbs_g -= 25;
      break;
    case "light_weekly":
      break;
    case "moderate_weekly":
      values.calories += 100;
      values.protein_g += 5;
      break;
    case "active_daily":
      values.calories += 200;
      values.carbs_g += 25;
      values.protein_g += 10;
      break;
    case "very_active_daily":
      values.calories += 400;
      values.carbs_g += 50;
      values.protein_g += 15;
      break;
    default:
      break;
  }

  switch (goal) {
    case "muscle_gain":
      values.calories += 250;
      values.protein_g += 10;
      break;
    case "weight_management":
      values.calories -= 200;
      break;
    case "lower_sodium":
      values.sodium_mg = 1800;
      break;
    case "lower_sugar":
      values.sugar_g = 50;
      break;
    case "higher_fiber":
      values.fiber_g = 35;
      break;
    default:
      break;
  }

  if (comorbidities.includes("hypertension")) {
    values.sodium_mg = 1500;
  }

  if (comorbidities.includes("diabetes_prediabetes")) {
    values.sugar_g = 50;
  }

  if (comorbidities.includes("high_cholesterol")) {
    values.saturated_fat_g = 15;
  }

  if (comorbidities.includes("kidney_concerns")) {
    values.sodium_mg = Math.min(values.sodium_mg, 1500);
  }

  return values;
}

function getMealCalorieTarget(dailyCalories, mealType) {
  switch (mealType) {
    case "breakfast":
      return dailyCalories * 0.25;
    case "lunch":
      return dailyCalories * 0.35;
    case "dinner":
      return dailyCalories * 0.35;
    case "snack":
      return dailyCalories * 0.1;
    default:
      return dailyCalories / 3;
  }
}

function getMetricTarget(key, dailyValues, mealType) {
  if (key === "calories") {
    return getMealCalorieTarget(dailyValues?.calories || 2000, mealType);
  }

  return dailyValues?.[key] || null;
}

function getDVPercent(key, value, dailyValues, mealType) {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return null;

  const dv = getMetricTarget(key, dailyValues, mealType);
  if (!dv) return null;

  return (numericValue / dv) * 100;
}

export default function AnalyzeFoodPage() {
  const [form, setForm] = useState(initialState);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    setUserProfile(loadUserProfile());
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!imageFile) {
      setError("Choose a food image before analyzing.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append("image", imageFile);
      data.append("notes", form.notes);
      data.append("goal", userProfile?.goal || "");
      data.append("meal_type", form.mealType);

      const response = await postForm("/analyze-food", data);
      setResult(response);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsLoading(false);
    }
  }

  const dailyValues = useMemo(
    () => getPersonalizedDailyValues(userProfile || {}),
    [userProfile]
  );

  const caloriePercent = result
    ? getDVPercent("calories", result.estimated_nutrition?.calories, dailyValues, form.mealType)
    : null;
  const calorieVisual = result
    ? getMetricVisualState(
        "calories",
        result.estimated_nutrition?.calories,
        getMetricTarget("calories", dailyValues, form.mealType)
      )
    : getMetricVisualState("calories", null, null);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6">
      <PageIntro
        title="Upload a meal and get a fast nutrition read."
        description="This flow sends the image to FastAPI, then uses the OpenAI API to estimate ingredients, macros, risks, and next actions in structured JSON."
        disclaimer="Nutrition estimates are generated from image analysis and may vary based on ingredients, portion size, and preparation method. For informational purposes only — not medical or dietary advice."
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_minmax(0,1fr)]">
        <form onSubmit={handleSubmit} className="glass-panel space-y-6 px-6 py-6">
          <div>
            <label className="field-label" htmlFor="image">
              Food image
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              className="field-input file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
            />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="status-chip">Preview</span>
              {!imageFile && <span className="text-sm text-ink/55">No file selected</span>}
            </div>

            {previewUrl ? (
              <div className="flex h-56 items-center justify-center overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
                <img
                  src={previewUrl}
                  alt="Selected food preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-ink/55">
                Upload your food photo to preview it here.
              </div>
            )}
          </div>

          <div>
            <label className="field-label" htmlFor="mealType">
              Meal type
            </label>
            <select
              id="mealType"
              className="field-input"
              value={form.mealType}
              onChange={(event) =>
                setForm((current) => ({ ...current, mealType: event.target.value }))
              }
            >
              {MEAL_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="notes">
              Extra notes
            </label>
            <textarea
              id="notes"
              rows={6}
              className="field-input resize-none"
              placeholder="Add known ingredients, portion details, or where the meal came from."
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
            />
          </div>

          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          ) : null}

          <button type="submit" className="primary-button w-full" disabled={isLoading}>
            {isLoading ? "Analyzing image..." : "Analyze food"}
          </button>
        </form>

        <div className="glass-panel min-w-0 max-h-[797px] overflow-y-auto px-6 py-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="field-label">Nutrition snapshot</span>
              {result && (
                <div className="rounded-full border-4 border-slate-300 px-3 py-1 text-center">
                  <p className="text-[9pt] uppercase tracking-[0.12em] text-ink/60">
                    Calories
                  </p>
                  <p className={`text-xl font-semibold ${calorieVisual.textClass}`}>
                    {result.estimated_nutrition?.calories} kcal
                  </p>
                  {caloriePercent != null && (
                    <p className={`mt-1 text-xs ${calorieVisual.textClass}`}>
                      {calorieVisual.label} · {Math.round(caloriePercent)}% meal target
                    </p>
                  )}
                </div>
              )}
            </div>

            {result ? (
              <div className="mt-2 space-y-4">
                <h2 className="text-2xl font-semibold leading-snug">
                  {result.meal_name}
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(result.estimated_nutrition)
                    .filter(([key]) => key !== "calories")
                    .slice(0, 7)
                    .map(([key, value]) => {
                      const target = getMetricTarget(key, dailyValues, form.mealType);
                      const visual = getMetricVisualState(key, value, target);

                      return (
                        <div
                          key={key}
                          className={`rounded-xl px-3 py-2 ${visual.tileClass}`}
                        >
                          <p className="whitespace-nowrap text-[11px] uppercase tracking-[0.12em] text-ink">
                            {formatNutritionLabel(key)}
                          </p>
                          <p className="mt-1 text-xl font-semibold text-ink">{value}</p>

                          {visual.percent != null && (
                            <p className="mt-1 text-xs text-ink/60">
                              {visual.label} · {Math.round(visual.percent)}% DV
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-ink/60">
                Your analyzed meal summary, ingredient guesses, and macro estimates will appear here.
              </p>
            )}
          </div>

          <div className="pt-6">
            <span className="field-label">Ingredients</span>

            {result ? (
              <ul className="mt-5 space-y-2 text-sm text-ink/75">
                {result.ingredients.map((ingredient) => (
                  <li key={ingredient.name} className="rounded-2xl bg-slate-50 px-4 py-3">
                    {ingredient.name} · {ingredient.estimated_amount} · confidence {ingredient.confidence}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-sm leading-6 text-ink/60">
                Ingredient estimates will appear here after analysis.
              </p>
            )}
          </div>
        </div>

        <div className="min-w-0 space-y-6">
          <div className="glass-panel min-w-0 h-[797px] overflow-y-auto px-6 py-6">
            <span className="field-label">Coaching signals</span>

            {result ? (
              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/50">
                    Health signals
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-ink/75">
                    {result.health_signals.map((signal) => (
                      <li key={signal} className="rounded-2xl bg-slate-50 px-4 py-3">
                        {signal}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/50">
                    Next actions
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-ink/75">
                    {result.next_best_actions.map((action) => (
                      <li key={action} className="rounded-2xl bg-mint/25 px-4 py-3">
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-ink/60">
                NutriLens will highlight tradeoffs, sodium or sugar flags, and practical suggestions.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
