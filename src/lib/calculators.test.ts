import { describe, it, expect } from "vitest";
import { bmi, tdee, bodyFat, idealWeight } from "./calculators";

describe("bmi", () => {
  it("calculates BMI correctly for a 70kg/175cm person", () => {
    const result = bmi(70, 175);
    expect(result.value).toBe(22.9);
    expect(result.category).toBe("Normal");
  });

  it("classifies underweight correctly", () => {
    expect(bmi(50, 180).category).toBe("Underweight");
  });

  it("classifies overweight correctly", () => {
    expect(bmi(90, 175).category).toBe("Overweight");
  });

  it("classifies obese correctly", () => {
    expect(bmi(120, 175).category).toBe("Obese");
  });

  it("returns value rounded to 1 decimal place", () => {
    const result = bmi(70, 175);
    expect(result.value.toString()).toMatch(/^\d+\.\d$/);
  });
});

describe("tdee", () => {
  it("calculates male TDEE with Mifflin-St Jeor correctly", () => {
    // Male, 80kg, 180cm, 25yo, sedentary (×1.2)
    // BMR = 10*80 + 6.25*180 - 5*25 + 5 = 800 + 1125 - 125 + 5 = 1805
    // TDEE = 1805 * 1.2 = 2166
    expect(tdee(80, 180, 25, "male", 1.2)).toBe(2166);
  });

  it("calculates female TDEE with Mifflin-St Jeor correctly", () => {
    // Female, 60kg, 165cm, 30yo, moderate (×1.55)
    // BMR = 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
    // TDEE = 1320.25 * 1.55 = 2046.3875 → rounded to 2046
    expect(tdee(60, 165, 30, "female", 1.55)).toBe(2046);
  });

  it("returns a higher TDEE for more active users", () => {
    const sedentary = tdee(70, 170, 28, "male", 1.2);
    const veryActive = tdee(70, 170, 28, "male", 1.725);
    expect(veryActive).toBeGreaterThan(sedentary);
  });

  it("returns an integer", () => {
    const result = tdee(75, 175, 30, "male", 1.375);
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe("bodyFat", () => {
  it("calculates male body fat % using US Navy formula", () => {
    // Male, 180cm, waist 85cm, neck 38cm — should produce a physiologically plausible result
    const result = bodyFat("male", 180, 85, 38);
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThan(5);
    expect(result!).toBeLessThan(40);
  });

  it("calculates female body fat % when hips measurement provided", () => {
    const result = bodyFat("female", 165, 75, 33, 97);
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThan(10);
    expect(result!).toBeLessThan(50);
  });

  it("returns null for female with no hips measurement", () => {
    expect(bodyFat("female", 165, 75, 33)).toBeNull();
  });

  it("returns value rounded to 1 decimal place for male", () => {
    const result = bodyFat("male", 180, 85, 38);
    expect(result!.toString()).toMatch(/^\d+\.\d$/);
  });
});

describe("idealWeight", () => {
  it("calculates male ideal weight range using Devine formula", () => {
    // Male, 180cm — 10.9 inches over 5ft, base 50, mid ≈ 75.07
    const result = idealWeight(180, "male");
    expect(result.min).toBeLessThan(result.max);
    expect(result.min).toBeCloseTo(67.6, 0);
    expect(result.max).toBeCloseTo(82.6, 0);
  });

  it("calculates female ideal weight range using Devine formula", () => {
    // Female, 165cm — ~4.96 inches over 5ft, base 45.5, mid ≈ 56.9
    const result = idealWeight(165, "female");
    expect(result.min).toBeLessThan(result.max);
    expect(result.min).toBeCloseTo(51.2, 0);
    expect(result.max).toBeCloseTo(62.6, 0);
  });

  it("does not go below base weight for someone under 5ft", () => {
    const result = idealWeight(140, "male"); // well under 5ft
    expect(result.min).toBeGreaterThanOrEqual(0);
    expect(result.max).toBeGreaterThan(result.min);
  });

  it("returns values rounded to 1 decimal place", () => {
    const result = idealWeight(175, "male");
    expect(result.min.toString()).toMatch(/^\d+\.\d$/);
    expect(result.max.toString()).toMatch(/^\d+\.\d$/);
  });
});
