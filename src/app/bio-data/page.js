"use client";

import { useEffect, useState } from "react";
import { PageIntro } from "@/components/page-intro";
import { defaultUserProfile, loadUserProfile, saveUserProfile } from "@/lib/user-profile";
import {
  GOAL_OPTIONS,
  AGE_RANGE_OPTIONS,
  ACTIVITY_LEVEL_OPTIONS,
  COMORBIDITY_OPTIONS,
} from "@/lib/profile-options";

export default function BioDataPage() {
  const [profile, setProfile] = useState(defaultUserProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(loadUserProfile());
  }, []);

  function update(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function toggleComorbidity(value) {
    setProfile((current) => {
      const list = current.comorbidities || [];
      const exists = list.includes(value);

      return {
        ...current,
        comorbidities: exists
          ? list.filter((item) => item !== value)
          : [...list, value],
      };
    });
    setSaved(false);
  }

  function handleSave(event) {
    event.preventDefault();
    saveUserProfile(profile);
    setSaved(true);
  }

  return (
    <div className="space-y-8">
      <PageIntro
        title="Bio data"
        description="Manage your health context so NutriLens can personalize analysis across the app."
      />

      <form onSubmit={handleSave} className="glass-panel max-w-3xl space-y-6 px-6 py-6">
        <div>
          <label className="field-label" htmlFor="goal">
            Goal
          </label>
          <select
            id="goal"
            className="field-input"
            value={profile.goal}
            onChange={(event) => update("goal", event.target.value)}
          >
            {GOAL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="height_cm">
              Height (cm)
            </label>
            <input
              id="height_cm"
              type="number"
              className="field-input"
              value={profile.height_cm}
              onChange={(event) => update("height_cm", event.target.value)}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="weight_kg">
              Weight (kg)
            </label>
            <input
              id="weight_kg"
              type="number"
              className="field-input"
              value={profile.weight_kg}
              onChange={(event) => update("weight_kg", event.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="age_range">
              Age range
            </label>
            <select
              id="age_range"
              className="field-input"
              value={profile.age_range}
              onChange={(event) => update("age_range", event.target.value)}
            >
              {AGE_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="activity_level">
              Activity level
            </label>
            <select
              id="activity_level"
              className="field-input"
              value={profile.activity_level}
              onChange={(event) => update("activity_level", event.target.value)}
            >
              {ACTIVITY_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="field-label mb-0">Special health conditions</p>
            <p className="mt-1 text-xs leading-relaxed text-ink/55">
              Optional. Stored locally on this device for personalization.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {COMORBIDITY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink/80"
              >
                <input
                  type="checkbox"
                  checked={(profile.comorbidities || []).includes(option.value)}
                  onChange={() => toggleComorbidity(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="field-label" htmlFor="other_conditions">
              Other conditions or notes
            </label>
            <textarea
              id="other_conditions"
              rows={4}
              className="field-input resize-none"
              placeholder="Optional: add anything important for nutrition context."
              value={profile.other_conditions || ""}
              onChange={(event) => update("other_conditions", event.target.value)}
            />
          </div>
        </div>

        {saved ? (
          <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
            Profile saved.
          </p>
        ) : null}

        <button type="submit" className="primary-button">
          Save changes
        </button>
      </form>
    </div>
  );
}