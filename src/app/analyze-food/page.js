"use client";

import { useEffect, useState } from "react";
import { postForm } from "@/lib/api";
import { PageIntro } from "@/components/page-intro";

const initialState = {
  notes: "",
  goal: "",
};

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

function getNutrientTileClass(flag) {
  if (!flag) return "bg-slate-200";

  const { level, direction } = flag;

  if (direction === "limit") {
    if (level === "high") return "bg-red-200";
    if (level === "moderate") return "bg-yellow-200";
    if (level === "low") return "bg-green-200";
  }

  if (direction === "encourage") {
    if (level === "high") return "bg-green-200";
    if (level === "moderate") return "bg-yellow-200";
    if (level === "low") return "bg-red-200";
  }

  return "bg-slate-300";
}

export default function AnalyzeFoodPage() {
  const [form, setForm] = useState(initialState);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

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
      data.append("goal", form.goal);

      const response = await postForm("/analyze-food", data);
      setResult(response);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsLoading(false);
    }
  }

  const nutrientFlags = result?.nutrient_flags ?? {};

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
              <div className="flex h-56 items-center justify-center overflow-hidden 
                rounded-[24px] border border-slate-200 bg-slate-50">
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
            <label className="field-label" htmlFor="goal">
              Goal context
            </label>
            <input
              id="goal"
              className="field-input"
              placeholder="Examples: high-protein lunch, lower sodium dinner, weight-loss friendly"
              value={form.goal}
              onChange={(event) =>
                setForm((current) => ({ ...current, goal: event.target.value }))
              }
            />
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

    <div className="glass-panel flex h-full flex-col px-6 py-6">
      <div>
    <div className="flex items-center justify-between">
      <span className="field-label">Nutrition snapshot</span>
        {result && (
          <div className="rounded-full border-4 border-slate-300 px-3 py-1 text-center">
            <p className="text-[9pt] uppercase tracking-[0.12em] text-ink/60">
              Calories
            </p>
            <p className="text-xl font-semibold text-ink">
              {result.estimated_nutrition?.calories} kcal
            </p>
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
              const flag = nutrientFlags[key];

              return (
                <div
                  key={key}
                  className={`rounded-xl px-3 py-2 ${getNutrientTileClass(flag)}`}
                >
                  <p className="whitespace-nowrap text-[11px] uppercase tracking-[0.12em] text-ink">
                    {formatNutritionLabel(key)}
                  </p>
                  <p className="mt-1 text-xl font-semibold text-ink">{value}</p>

                  {flag?.percent_dv != null && (
                    <p className="mt-1 text-xs text-ink/60">{flag.percent_dv}% DV</p>
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
  <div className="glass-panel px-6 py-6">
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
