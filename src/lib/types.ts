export type Sex = "male" | "female" | "other";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type GoalType = "fat_loss" | "muscle_gain" | "recomposition";
export type WorkoutSetting = "gym" | "home" | "both";
export type JudoIntensity = "light" | "moderate" | "hard";
export type Sport = "none" | "judo" | "bjj" | "boxing" | "mma" | "wrestling" | "running" | "cycling" | "football" | "other";

export interface OnboardingData {
  name: string;
  age: number | null;
  sex: Sex | null;
  heightCm: number | null;
  weightKg: number | null;
  experience: ExperienceLevel | null;
  activityLevel: ActivityLevel | null;
}

export interface PhotoData {
  consentGiven: boolean;
  currentPhotoBase64: string | null;
  goalPhotoBase64: string | null;
}

export interface QuestionnaireData {
  goalType: GoalType | null;
  workoutSetting: WorkoutSetting | null;
  injuries: string;
  sport: Sport;
}

export interface JudoData {
  sessionsPerWeek: number | null;
  intensity: JudoIntensity | null;
  hasCompetitionSoon: boolean;
  weeklySessionLog: string;
}

export interface WizardState {
  onboarding: OnboardingData;
  photos: PhotoData;
  questionnaire: QuestionnaireData;
  judo: JudoData;
}

export interface EstimateResult {
  timeframeMin: number;
  timeframeMax: number;
  timeframeUnit: "weeks" | "months";
  confidenceLevel: "low" | "medium" | "high";
  reasoning: string[];
  trainingGuidance: string[];
  nutritionNote: string;
  disclaimer: string;
}
