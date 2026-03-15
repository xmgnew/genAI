const METRIC_LABELS = {
  calories: "Calories",
  protein_g: "Protein",
  carbs_g: "Carbs",
  fat_g: "Fat",
  fiber_g: "Fiber",
  sugar_g: "Sugar",
  sodium_mg: "Sodium",
  saturated_fat_g: "Sat. Fat",
};

const LIMIT_METRICS = new Set(["sodium_mg", "sugar_g", "saturated_fat_g"]);
const ENCOURAGE_METRICS = new Set(["protein_g", "fiber_g"]);
const RANGE_METRICS = new Set(["calories", "carbs_g", "fat_g"]);

function buildVisualState({ label, tileClass, textClass, percent }) {
  return {
    label,
    tileClass,
    textClass,
    percent,
  };
}

export function formatNutritionLabel(metricName) {
  return METRIC_LABELS[metricName] || metricName.replaceAll("_", " ");
}

export function getMetricVisualState(metricName, value, targetValue) {
  const numericValue = Number(value);
  const numericTarget = Number(targetValue);

  if (Number.isNaN(numericValue) || Number.isNaN(numericTarget) || numericTarget <= 0) {
    return buildVisualState({
      label: "",
      tileClass: "bg-slate-200",
      textClass: "text-ink",
      percent: null,
    });
  }

  const percent = (numericValue / numericTarget) * 100;

  if (LIMIT_METRICS.has(metricName)) {
    if (percent <= 50) {
      return buildVisualState({
        label: "Low",
        tileClass: "bg-green-200",
        textClass: "text-green-700",
        percent,
      });
    }

    if (percent <= 100) {
      return buildVisualState({
        label: "Moderate",
        tileClass: "bg-yellow-200",
        textClass: "text-yellow-700",
        percent,
      });
    }

    return buildVisualState({
      label: "High",
      tileClass: "bg-red-200",
      textClass: "text-red-600",
      percent,
    });
  }

  if (ENCOURAGE_METRICS.has(metricName)) {
    if (percent < 75) {
      return buildVisualState({
        label: "Below target",
        tileClass: "bg-blue-200",
        textClass: "text-blue-700",
        percent,
      });
    }

    if (percent <= 120) {
      return buildVisualState({
        label: "On track",
        tileClass: "bg-green-200",
        textClass: "text-green-700",
        percent,
      });
    }

    return buildVisualState({
      label: "Above target",
      tileClass: "bg-yellow-200",
      textClass: "text-yellow-700",
      percent,
    });
  }

  if (RANGE_METRICS.has(metricName)) {
    if (percent < 75) {
      return buildVisualState({
        label: "Below target",
        tileClass: "bg-blue-200",
        textClass: "text-blue-700",
        percent,
      });
    }

    if (percent <= 110) {
      return buildVisualState({
        label: "In range",
        tileClass: "bg-green-200",
        textClass: "text-green-700",
        percent,
      });
    }

    if (percent <= 130) {
      return buildVisualState({
        label: "Slightly high",
        tileClass: "bg-yellow-200",
        textClass: "text-yellow-700",
        percent,
      });
    }

    return buildVisualState({
      label: "High",
      tileClass: "bg-red-200",
      textClass: "text-red-600",
      percent,
    });
  }

  return buildVisualState({
    label: "",
    tileClass: "bg-slate-200",
    textClass: "text-ink",
    percent,
  });
}
