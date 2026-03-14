"use client";

import { useState } from "react";
import { postJson } from "@/lib/api";
import { JsonPanel } from "@/components/json-panel";
import { PageIntro } from "@/components/page-intro";

const initialState = {
  focus: "",
  meal_a: {
    name: "Meal A",
    description: "",
  },
  meal_b: {
    name: "Meal B",
    description: "",
  },
};

export default function CompareMealsPage() {
  const [form, setForm] = useState(initialState);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function updateMeal(mealKey, field, value) {
    setForm((current) => ({
      ...current,
      [mealKey]: {
        ...current[mealKey],
        [field]: value,
      },
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await postJson("/compare-meals", form);
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
        eyebrow="Compare Meals"
        title="Run a side-by-side nutrition decision."
        description="Describe two meals and NutriLens will compare them across nutrition density, balance, and practical fit for your goal."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleSubmit} className="glass-panel space-y-6 px-6 py-6">
          <div>
            <label className="field-label" htmlFor="focus">
              Decision focus
            </label>
            <input
              id="focus"
              className="field-input"
              placeholder="Examples: muscle gain, lower calories, better post-workout meal"
              value={form.focus}
              onChange={(event) => setForm((current) => ({ ...current, focus: event.target.value }))}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {["meal_a", "meal_b"].map((mealKey, index) => (
              <div key={mealKey} className="rounded-[26px] border border-slate-200 bg-white p-4">
                <label className="field-label" htmlFor={`${mealKey}-name`}>
                  {index === 0 ? "Meal A name" : "Meal B name"}
                </label>
                <input
                  id={`${mealKey}-name`}
                  className="field-input"
                  value={form[mealKey].name}
                  onChange={(event) => updateMeal(mealKey, "name", event.target.value)}
                />
                <label className="field-label mt-4" htmlFor={`${mealKey}-description`}>
                  Description
                </label>
                <textarea
                  id={`${mealKey}-description`}
                  rows={8}
                  className="field-input resize-none"
                  placeholder="List ingredients, portion size, and cooking style."
                  value={form[mealKey].description}
                  onChange={(event) => updateMeal(mealKey, "description", event.target.value)}
                />
              </div>
            ))}
          </div>

          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

          <button type="submit" className="primary-button w-full" disabled={isLoading}>
            {isLoading ? "Comparing meals..." : "Compare meals"}
          </button>
        </form>

        <div className="space-y-6">
          <div className="glass-panel px-6 py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="status-chip">Comparison result</span>
              {result ? (
                <span className="rounded-full bg-mint px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink">
                  Winner: {result.winner}
                </span>
              ) : null}
            </div>

            {result ? (
              <div className="mt-5 space-y-5">
                <div>
                  <h2 className="text-3xl">{result.verdict}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink/72">{result.recommendation}</p>
                </div>
                <div className="grid gap-3">
                  {result.scorecard.map((item) => (
                    <div key={item.category} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/50">{item.category}</p>
                        <span className="status-chip">{item.winner}</span>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl bg-white px-4 py-3 text-sm text-ink/72">{item.meal_a}</div>
                        <div className="rounded-2xl bg-white px-4 py-3 text-sm text-ink/72">{item.meal_b}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/50">Tradeoffs</p>
                  <ul className="mt-3 space-y-2">
                    {result.tradeoffs.map((item) => (
                      <li key={item} className="rounded-2xl bg-white px-4 py-3 text-sm text-ink/75">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-ink/60">
                The winning meal, reasoning, tradeoffs, and scorecard will render here after submission.
              </p>
            )}
          </div>

          <JsonPanel title="Raw JSON response" data={result} />
        </div>
      </div>
    </div>
  );
}
