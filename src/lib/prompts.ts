import { WizardState } from "./types";

const GRAPPLING_SPORTS = new Set(["judo", "bjj", "wrestling", "mma"]);

export function buildEstimatePrompt(state: WizardState, hasPhotos: boolean): string {
  const { onboarding, questionnaire, judo } = state;
  const sport = questionnaire.sport;

  const isGrappling = GRAPPLING_SPORTS.has(sport);

  const sportSection = isGrappling
    ? `
GRAPPLING SPORT TRAINING:
- Sport: ${sport}
- Sessions per week: ${judo.sessionsPerWeek}
- Intensity: ${judo.intensity}
- Competition soon (within 8 weeks): ${judo.hasCompetitionSoon ? "yes" : "no"}
- Weekly session log: ${judo.weeklySessionLog || "not provided"}
Factor grappling fatigue (grip exhaustion, uchikomi, randori) into training load calculations.
`
    : sport !== "none"
    ? `
SPORT TRAINING:
- Sport: ${sport}
Factor sport-specific fatigue and recovery into training load calculations.
`
    : "";

  const photoSection = hasPhotos
    ? `
PHOTO CONTEXT:
The user has uploaded a current body photo and a goal physique photo. Use the visual information to inform your physique assessment. Acknowledge that the goal photo may show different genetics, lighting, or editing. Do not over-promise based on photos.
`
    : "";

  const targetWeightLine =
    onboarding.targetWeight !== null && onboarding.targetWeight !== undefined
      ? `- Target weight: ${onboarding.targetWeight} kg (wants to change ${Math.abs((onboarding.weightKg ?? 0) - onboarding.targetWeight).toFixed(1)} kg)`
      : "";

  return `You are an experienced, evidence-based fitness coach. You give realistic, honest estimates — never false promises.

USER PROFILE:
- Name: ${onboarding.name || "the user"}
- Age: ${onboarding.age}
- Sex: ${onboarding.sex}
- Height: ${onboarding.heightCm} cm
- Current weight: ${onboarding.weightKg} kg
${targetWeightLine}- Training experience: ${onboarding.experience}
- Activity level: ${onboarding.activityLevel}

GOAL:
- Goal type: ${questionnaire.goalType}
- Workout setting: ${questionnaire.workoutSetting}
- Injuries/limitations: ${questionnaire.injuries || "none reported"}
- Sport: ${questionnaire.sport}
${sportSection}${photoSection}
TASK:
Return a JSON object with this exact structure. Do not include any text outside the JSON.

{
  "timeframeMin": <integer months>,
  "timeframeMax": <integer months>,
  "timeframeUnit": "months",
  "confidenceLevel": "low" | "medium" | "high",
  "reasoning": [<3-5 short bullet strings explaining the estimate, referencing their specific data points>],
  "trainingGuidance": [<3-5 short bullet strings about weekly training structure, specific to their goal, setting, and sport>],
  "nutritionNote": "<1-2 sentence high-level nutrition guidance — NOT a meal plan, NOT calorie counting>",
  "disclaimer": "This estimate is for general guidance only. It is not medical advice and does not replace a doctor, physiotherapist, registered dietitian, or qualified coach."
}

Rules:
- timeframeMin and timeframeMax must form a realistic range (e.g. 6 and 12), never exact
- confidenceLevel reflects how complete the data is and how predictable the goal is
- reasoning must reference this user's specific numbers and circumstances, not generic advice
- If injuries are reported, note the recommendation to see a physiotherapist
- If a grappling sport is selected, explicitly factor grappling fatigue into training guidance
- Wording must be cautious, supportive, and non-medical
- Never claim the app can perfectly predict body transformation`;
}
