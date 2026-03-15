"use client";

import { useEffect, useMemo, useState } from "react";
import { postJson } from "@/lib/api";
import { JsonPanel } from "@/components/json-panel";
import { PageIntro } from "@/components/page-intro";
import { loadUserProfile } from "@/lib/user-profile";

const defaultMeals = [
  { name: "Breakfast", description: "", time: "08:00" },
  { name: "Lunch", description: "", time: "12:30" },
  { name: "Dinner", description: "", time: "19:00" },
];

function formatNutritionLabel(key) {
  const labelMap = {
    calories: "Calories",
    protein_g: "Protein",
    carbs_g: "Carbs",
    fat_g: "Fat",
    fiber_g: "Fiber",
    sugar_g: "Sugar",
    sodium_mg: "Sodium",
    saturated_fat_g: "Sat. Fat",
  };

  return labelMap[key] || key.replaceAll("_", " ");
}

function formatGoalLabel(goal) {
  const labelMap = {
    general_wellness: "General wellness",
    weight_management: "Weight management",
    muscle_gain: "Muscle gain",
    lower_sodium: "Lower sodium",
    lower_sugar: "Lower sugar",
    higher_fiber: "Higher fiber",
  };

  return labelMap[goal] || goal || "Not set";
}

function getPersonalizedDailyValues(profile) {
  const weightKg = Number(profile?.weight_kg);
  const activity = profile?.activity_level;
  const goal = profile?.goal;
  const comorbidities = profile?.comorbidities || [];

  const values = {
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

function getDailyNutritionStatus(key, actualValue, targetValue) {
  const actual = Number(actualValue);
  const target = Number(targetValue);

  if (Number.isNaN(actual) || Number.isNaN(target) || !target) {
    return { state: "neutral", percent: null };
  }

  const percent = (actual / target) * 100;

  const limitNutrients = ["sodium_mg", "sugar_g", "saturated_fat_g"];
  const encourageNutrients = ["protein_g", "fiber_g"];
  const targetRangeNutrients = ["calories", "carbs_g", "fat_g"];

  if (limitNutrients.includes(key)) {
    if (percent <= 50) return { state: "low", percent };
    if (percent <= 100) return { state: "moderate", percent };
    return { state: "high", percent };
  }

  if (encourageNutrients.includes(key)) {
    if (percent < 75) return { state: "deficit", percent };
    if (percent < 95) return { state: "close", percent };
    if (percent <= 120) return { state: "enough", percent };
    return { state: "high", percent };
  }

  if (targetRangeNutrients.includes(key)) {
    if (percent < 75) return { state: "deficit", percent };
    if (percent < 95) return { state: "close", percent };
    if (percent <= 110) return { state: "in_range", percent };
    return { state: "over", percent };
  }

  return { state: "neutral", percent };
}

function getDailyTileClass(state) {
  switch (state) {
    case "deficit":
      return "bg-blue-200";
    case "close":
      return "bg-yellow-200";
    case "enough":
      return "bg-green-200";
    case "in_range":
      return "bg-green-200";
    case "over":
      return "bg-red-200";
    case "low":
      return "bg-green-200";
    case "moderate":
      return "bg-yellow-200";
    case "high":
      return "bg-red-200";
    default:
      return "bg-slate-200";
  }
}

function getDailyStatusLabel(state) {
  switch (state) {
    case "deficit":
      return "Deficit";
    case "close":
      return "Close";
    case "enough":
      return "Enough";
    case "in_range":
      return "In range";
    case "over":
      return "Over";
    case "low":
      return "Low";
    case "moderate":
      return "Moderate";
    case "high":
      return "High";
    default:
      return "";
  }
}

export default function DailyNutritionPage() {
  const [date, setDate] = useState("");
  const [meals, setMeals] = useState(defaultMeals);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    setUserProfile(loadUserProfile());
  }, []);

  function updateMeal(index, field, value) {
    setMeals((current) =>
      current.map((meal, mealIndex) =>
        mealIndex === index ? { ...meal, [field]: value } : meal
      )
    );
  }

  function addMeal() {
    setMeals((current) => [
      ...current,
      { name: `Meal ${current.length + 1}`, description: "", time: "" },
    ]);
  }

  function removeMeal(index) {
    setMeals((current) =>
      current.length > 1
        ? current.filter((_, mealIndex) => mealIndex !== index)
        : current
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await postJson("/daily-nutrition", {
        date,
        meals: meals.filter((meal) => meal.description.trim()),
        goal: userProfile?.goal || "",
        user_profile: {
          ...(userProfile?.height_cm ? { height_cm: Number(userProfile.height_cm) } : {}),
          ...(userProfile?.weight_kg ? { weight_kg: Number(userProfile.weight_kg) } : {}),
          ...(userProfile?.age_range ? { age_range: userProfile.age_range } : {}),
          ...(userProfile?.activity_level ? { activity_level: userProfile.activity_level } : {}),
          ...(userProfile?.comorbidities ? { comorbidities: userProfile.comorbidities } : {}),
          ...(userProfile?.other_conditions ? { other_conditions: userProfile.other_conditions } : {}),
        },
      });
      setResult(response);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsLoading(false);
    }
  }

  const dailyTargets = useMemo(
    () => getPersonalizedDailyValues(userProfile || {}),
    [userProfile]
  );

  return (
    <div className="space-y-8">
      <PageIntro
        title="Summarize an entire day in one pass."
        description="Capture meals across the day and generate a concise AI summary with totals, gaps, and a practical action plan."
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <form onSubmit={handleSubmit} className="glass-panel space-y-6 px-6 py-6">
          <div className="grid items-end gap-5 md:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                type="text"
                inputMode="numeric"
                placeholder="yyyy-mm-dd"
                className="field-input"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="field-label mb-0">Meals</span>
              <button type="button" className="secondary-button" onClick={addMeal}>
                Add meal
              </button>
            </div>

            {meals.map((meal, index) => (
              <div
                key={`${meal.name}-${index}`}
                className="rounded-[26px] border border-slate-200 bg-white p-4"
              >
                <div className="grid gap-4 md:grid-cols-[1fr_160px_auto]">
                  <div>
                    <label className="field-label" htmlFor={`meal-name-${index}`}>
                      Meal name
                    </label>
                    <input
                      id={`meal-name-${index}`}
                      className="field-input"
                      value={meal.name}
                      onChange={(event) => updateMeal(index, "name", event.target.value)}
                    />
                  </div>

                  <div>
                    <label className="field-label" htmlFor={`meal-time-${index}`}>
                      Time
                    </label>
                    <input
                      id={`meal-time-${index}`}
                      type="time"
                      className="field-input"
                      value={meal.time}
                      onChange={(event) => updateMeal(index, "time", event.target.value)}
                    />
                  </div>

                  {meals.length > 1 && (
                    <div className="flex items-center pt-7">
                      <button
                        type="button"
                        onClick={() => removeMeal(index)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-ink/60 transition hover:border-red-400 hover:text-red-500"
                        aria-label="Delete meal"
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <label className="field-label" htmlFor={`meal-description-${index}`}>
                    What did you eat?
                  </label>
                  <textarea
                    id={`meal-description-${index}`}
                    rows={5}
                    className="field-input resize-none"
                    placeholder="Examples: Greek yogurt with berries and granola, chicken burrito bowl, latte and cookie."
                    value={meal.description}
                    onChange={(event) =>
                      updateMeal(index, "description", event.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button type="submit" className="primary-button w-full" disabled={isLoading}>
            {isLoading ? "Summarizing day..." : "Generate daily summary"}
          </button>
        </form>

        <div className="space-y-6">
          <div className="glass-panel px-6 py-6">
            <div className="flex items-center justify-between">
              <span className="status-chip">Daily summary</span>
              {result ? <span className="status-chip">Score {result.overall_score}/100</span> : null}
            </div>

            {result ? (
              <div className="mt-5 space-y-6">
                <div>
                  <h2 className="text-3xl">{result.day_summary}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink/72">{result.hydration_tip}</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {Object.entries(result.total_estimated_nutrition).map(([key, value]) => {
                    const target = dailyTargets[key];
                    const { state, percent } = getDailyNutritionStatus(key, value, target);

                    return (
                      <div key={key} className={`rounded-3xl p-4 ${getDailyTileClass(state)}`}>
                        <p className="text-xs uppercase tracking-[0.16em] text-ink/60">
                          {formatNutritionLabel(key)}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
                        {percent != null ? (
                          <p className="mt-1 text-xs text-ink/65">
                            {getDailyStatusLabel(state)} · {Math.round(percent)}% of target
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/50">
                      Highlights
                    </p>
                    <ul className="mt-3 space-y-2">
                      {result.highlights.map((item) => (
                        <li key={item} className="rounded-2xl bg-white px-4 py-3 text-sm text-ink/75">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/50">
                      Gaps
                    </p>
                    <ul className="mt-3 space-y-2">
                      {result.gaps.map((item) => (
                        <li key={item} className="rounded-2xl bg-white px-4 py-3 text-sm text-ink/75">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/50">
                      Action plan
                    </p>
                    <ul className="mt-3 space-y-2">
                      {result.action_plan.map((item) => (
                        <li key={item} className="rounded-2xl bg-mint/25 px-4 py-3 text-sm text-ink/75">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-ink/60">
                The daily roll-up, estimated totals, score, and improvement steps will appear here after submission.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}