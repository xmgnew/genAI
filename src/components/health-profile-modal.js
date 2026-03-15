"use client";

import { useEffect, useState } from "react";
import {
  defaultUserProfile,
  loadUserProfile,
  saveUserProfile,
} from "@/lib/user-profile";
import {
  GOAL_OPTIONS,
  AGE_RANGE_OPTIONS,
  ACTIVITY_LEVEL_OPTIONS,
} from "@/lib/profile-options";

export function HealthProfileModal({ open, onClose, onSave }) {
  const [profile, setProfile] = useState(defaultUserProfile);

  useEffect(() => {
    if (open) {
      setProfile(loadUserProfile());
    }
  }, [open]);

  function update(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function handleSave() {
    saveUserProfile(profile);
    onSave?.(profile);
    onClose?.();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
      <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Health profile</h2>
            <p className="mt-2 text-sm leading-6 text-ink/65">
              Add your health context so NutriLens can personalize nutrition feedback.
            </p>
          </div>

          <button
            type="button"
            className="rounded-full px-3 py-1 text-sm text-ink/60 hover:bg-slate-100"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="field-label" htmlFor="modal-goal">
              Goal
            </label>
            <select
              id="modal-goal"
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
              <label className="field-label" htmlFor="modal-height">
                Height (cm)
              </label>
              <input
                id="modal-height"
                type="number"
                className="field-input"
                value={profile.height_cm}
                onChange={(event) => update("height_cm", event.target.value)}
              />
            </div>

            <div>
              <label className="field-label" htmlFor="modal-weight">
                Weight (kg)
              </label>
              <input
                id="modal-weight"
                type="number"
                className="field-input"
                value={profile.weight_kg}
                onChange={(event) => update("weight_kg", event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="modal-age">
                Age range
              </label>
              <select
                id="modal-age"
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
              <label className="field-label" htmlFor="modal-activity">
                Activity level
              </label>
              <select
                id="modal-activity"
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
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="secondary-button" onClick={onClose}>
            Skip
          </button>
          <button type="button" className="primary-button" onClick={handleSave}>
            Save profile
          </button>
        </div>
      </div>
    </div>
  );
}