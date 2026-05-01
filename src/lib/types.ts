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
  targetWeight: number | null;
  experience: ExperienceLevel | null;
  activityLevel: ActivityLevel | null;
}

export interface QuestionnaireData {
  goalType: GoalType | null;
  workoutSetting: WorkoutSetting | null;
  injuries: string;
  sport: Sport;
  bodyFatPercent?: number;
}

export interface JudoData {
  sessionsPerWeek: number | null;
  intensity: JudoIntensity | null;
  hasCompetitionSoon: boolean;
  weeklySessionLog: string;
}

export interface CompetitionContext {
  isActivelyCompeting: boolean;
  weightClass: number | string | null;
  competitionDate: string | null;
}

export interface WizardState {
  onboarding: OnboardingData;
  questionnaire: QuestionnaireData;
  judo: JudoData;
  competitionContext: CompetitionContext;
  estimateResult: EstimateResult | null;
}

// Typed shape of wizard_state as stored in Supabase profiles.wizard_state
export interface WizardStateDB {
  onboarding?: Partial<OnboardingData>;
  questionnaire?: Partial<QuestionnaireData>;
  judo?: Partial<JudoData>;
  competitionContext?: Partial<CompetitionContext>;
  estimateResult?: EstimateResult | null;
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
