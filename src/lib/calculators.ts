export function bmi(weightKg: number, heightCm: number) {
  const h = heightCm / 100;
  const value = weightKg / (h * h);
  const category =
    value < 18.5 ? "Underweight" :
    value < 25   ? "Normal"      :
    value < 30   ? "Overweight"  : "Obese";
  return { value: +value.toFixed(1), category };
}

export function tdee(
  weightKg: number, heightCm: number, age: number,
  sex: "male" | "female", activity: number
) {
  // Mifflin-St Jeor BMR
  const bmr = sex === "male"
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  return Math.round(bmr * activity);
}

// US Navy body fat %
export function bodyFat(
  sex: "male" | "female",
  heightCm: number, waistCm: number, neckCm: number, hipsCm?: number
) {
  if (sex === "male") {
    return +(495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450).toFixed(1);
  }
  if (!hipsCm) return null;
  return +(495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipsCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450).toFixed(1);
}

// Devine formula ideal weight range
export function idealWeight(heightCm: number, sex: "male" | "female") {
  const inchesOver5ft = Math.max(0, heightCm / 2.54 - 60);
  const base = sex === "male" ? 50 : 45.5;
  const mid = base + 2.3 * inchesOver5ft;
  return { min: +(mid * 0.9).toFixed(1), max: +(mid * 1.1).toFixed(1) };
}

export const activityOptions = [
  { label: "Sedentary (desk job, no exercise)", value: 1.2 },
  { label: "Lightly active (1-3 days/week)", value: 1.375 },
  { label: "Moderately active (3-5 days/week)", value: 1.55 },
  { label: "Very active (6-7 days/week)", value: 1.725 },
  { label: "Extremely active (athlete/physical job)", value: 1.9 },
];
