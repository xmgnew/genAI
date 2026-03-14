"use client";

import { useState } from "react";
import { postJson } from "@/lib/api";
import { JsonPanel } from "@/components/json-panel";
import { PageIntro } from "@/components/page-intro";

const defaultMeals = [
  { name: "Breakfast", description: "", time: "08:00" },
  { name: "Lunch", description: "", time: "12:30" },
  { name: "Dinner", description: "", time: "19:00" },
];

export default function DailyNutritionPage() {
  const [date, setDate] = useState("");
  const [focus, setFocus] = useState("");
  const [calorieTarget, setCalorieTarget] = useState("");
  const [proteinTarget, setProteinTarget] = useState("");
  const [meals, setMeals] = useState(defaultMeals);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function updateMeal(index, field, value) {
    setMeals((current) => current.map((meal, mealIndex) => (mealIndex === index ? { ...meal, [field]: value } : meal)));
  }

  function addMeal() {
    setMeals((current) => [...current, { name: `Meal ${current.length + 1}`, description: "", time: "" }]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await postJson("/daily-nutrition", {
        date,
        meals: meals.filter((meal) => meal.description.trim()),
        goals: {
          focus,
          calorie_target: calorieTarget ? Number(calorieTarget) : null,
          protein_target_g: proteinTarget ? Number(proteinTarget) : null,
        },
      });
      setResult(response);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Daily Nutrition"
        title="Summarize an entire day in one pass."
        description="Capture meals across the day, pass your nutrition goals, and generate a concise AI summary with totals, gaps, and a practical action plan."
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <form onSubmit={handleSubmit} className="glass-panel spotlight-card space-y-6 px-6 py-6" data-click-fx>
          <div className="flex items-center justify-between">
            <div>
              <p className="story-kicker">Timeline builder</p>
              <p className="mt-2 text-2xl font-semibold text-ink">Daily intake log</p>
            </div>
            <span className="status-chip">Meals across the day</span>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="field-label" htmlFor="date">
                Date
              </label>
              <input id="date" type="date" className="field-input" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div>
              <label className="field-label" htmlFor="calorieTarget">
                Calorie target
              </label>
              <input
                id="calorieTarget"
                type="number"
                className="field-input"
                placeholder="2000"
                value={calorieTarget}
                onChange={(event) => setCalorieTarget(event.target.value)}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="proteinTarget">
                Protein target (g)
              </label>
              <input
                id="proteinTarget"
                type="number"
                className="field-input"
                placeholder="130"
                value={proteinTarget}
                onChange={(event) => setProteinTarget(event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="focus">
              Goal focus
            </label>
            <input
              id="focus"
              className="field-input"
              placeholder="Examples: fat loss, stable energy, reduce evening snacking"
              value={focus}
              onChange={(event) => setFocus(event.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="field-label mb-0">Meals</span>
              <button type="button" className="secondary-button" onClick={addMeal} data-click-fx>
                Add meal
              </button>
            </div>
            {meals.map((meal, index) => (
              <div key={`${meal.name}-${index}`} className="metric-card">
                <div className="grid gap-4 md:grid-cols-[1fr_160px]">
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
                    onChange={(event) => updateMeal(index, "description", event.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

          <button type="submit" className="primary-button w-full" disabled={isLoading} data-click-fx>
            {isLoading ? "Summarizing day..." : "Generate daily summary"}
          </button>
        </form>

        <div className="space-y-6">
          <div className="glass-panel spotlight-card px-6 py-6">
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
                  {Object.entries(result.total_estimated_nutrition).map(([key, value]) => (
                    <div key={key} className="metric-card">
                      <p className="text-xs uppercase tracking-[0.16em] text-ink/50">{key.replaceAll("_", " ")}</p>
                      <p className="mt-2 text-2xl font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/50">Highlights</p>
                    <ul className="mt-3 space-y-2">
                      {result.highlights.map((item) => (
                        <li key={item} className="rounded-2xl bg-white/75 px-4 py-3 text-sm text-ink/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/50">Gaps</p>
                    <ul className="mt-3 space-y-2">
                      {result.gaps.map((item) => (
                        <li key={item} className="rounded-2xl bg-white/75 px-4 py-3 text-sm text-ink/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/50">Action plan</p>
                    <ul className="mt-3 space-y-2">
                      {result.action_plan.map((item) => (
                        <li key={item} className="rounded-2xl bg-gradient-to-r from-mint/30 to-ocean/18 px-4 py-3 text-sm text-ink/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
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

          <JsonPanel title="Raw JSON response" data={result} />
        </div>
      </div>
    </div>
  );
}
