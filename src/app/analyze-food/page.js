"use client";

import { useEffect, useState } from "react";
import { postForm } from "@/lib/api";
import { JsonPanel } from "@/components/json-panel";
import { PageIntro } from "@/components/page-intro";

const initialState = {
  notes: "",
  goal: "",
};

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

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Analyze Food"
        title="Upload a meal and get a fast nutrition read."
        description="This flow sends the image to FastAPI, then uses the OpenAI API to estimate ingredients, macros, risks, and next actions in structured JSON."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleSubmit} className="glass-panel spotlight-card space-y-6 px-6 py-6" data-click-fx>
          <div className="flex items-center justify-between">
            <div>
              <p className="story-kicker">Capture input</p>
              <p className="mt-2 text-2xl font-semibold text-ink">Vision intake</p>
            </div>
            <span className="status-chip">Image + context</span>
          </div>

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
            <label className="field-label" htmlFor="goal">
              Goal context
            </label>
            <input
              id="goal"
              className="field-input"
              placeholder="Examples: high-protein lunch, lower sodium dinner, weight-loss friendly"
              value={form.goal}
              onChange={(event) => setForm((current) => ({ ...current, goal: event.target.value }))}
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
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
            />
          </div>

          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

          <button type="submit" className="primary-button w-full" disabled={isLoading} data-click-fx>
            {isLoading ? "Analyzing image..." : "Analyze food"}
          </button>
        </form>

        <div className="space-y-6">
          <div className="glass-panel spotlight-card min-h-72 overflow-hidden px-6 py-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="status-chip">Image preview</span>
              <span className="text-sm text-ink/55">{imageFile ? imageFile.name : "No file selected"}</span>
            </div>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Selected food preview"
                className="h-[22rem] w-full rounded-[24px] object-cover shadow-[0_24px_50px_rgba(13,27,42,0.18)]"
              />
            ) : (
              <div className="flex h-[22rem] items-center justify-center rounded-[24px] border border-dashed border-ink/15 bg-white/45 text-center text-sm text-ink/55">
                Upload a food photo to preview it here.
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-panel spotlight-card min-h-72 px-6 py-6">
              <span className="status-chip">Nutrition snapshot</span>
              {result ? (
                <div className="mt-5 space-y-4">
                  <div>
                    <h2 className="text-3xl">{result.meal_name}</h2>
                    <p className="mt-2 text-sm leading-6 text-ink/72">{result.summary}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(result.estimated_nutrition).map(([key, value]) => (
                      <div key={key} className="metric-card">
                        <p className="text-xs uppercase tracking-[0.16em] text-ink/50">{key.replaceAll("_", " ")}</p>
                        <p className="mt-2 text-2xl font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm leading-6 text-ink/60">
                  Your analyzed meal summary, ingredient guesses, and macro estimates will appear here.
                </p>
              )}
            </div>

            <div className="glass-panel glass-panel-dark min-h-72 px-6 py-6 text-white">
              <span className="status-chip">Coaching signals</span>
              {result ? (
                <div className="mt-5 space-y-5">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/45">Ingredients</p>
                    <ul className="mt-3 space-y-2 text-sm text-white/75">
                      {result.ingredients.map((ingredient) => (
                        <li key={ingredient.name} className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                          {ingredient.name} · {ingredient.estimated_amount} · confidence {ingredient.confidence}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/45">Health signals</p>
                    <ul className="mt-3 space-y-2 text-sm text-white/75">
                      {result.health_signals.map((signal) => (
                        <li key={signal} className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                          {signal}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/45">Next actions</p>
                    <ul className="mt-3 space-y-2 text-sm text-white/80">
                      {result.next_best_actions.map((action) => (
                        <li key={action} className="rounded-2xl bg-mint/20 px-4 py-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm leading-6 text-white/60">
                  NutriLens will highlight tradeoffs, sodium or sugar flags, and practical suggestions.
                </p>
              )}
            </div>
          </div>

          <JsonPanel title="Raw JSON response" data={result} />
        </div>
      </div>
    </div>
  );
}
