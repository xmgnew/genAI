export const defaultUserProfile = {
  goal: "",
  height_cm: "",
  weight_kg: "",
  age_range: "",
  activity_level: "",
  comorbidities: [],
  other_conditions: "",
};
  
  const STORAGE_KEY = "nutrilens-user-profile";
  
  export function loadUserProfile() {
    if (typeof window === "undefined") return defaultUserProfile;
  
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultUserProfile;
      return { ...defaultUserProfile, ...JSON.parse(raw) };
    } catch {
      return defaultUserProfile;
    }
  }
  
  export function saveUserProfile(profile) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }
  
  export function hasUserProfile() {
    const profile = loadUserProfile();
    return Boolean(profile.goal);
  }
  
  export function clearUserProfile() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  }