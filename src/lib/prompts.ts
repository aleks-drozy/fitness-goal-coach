import { WizardState } from "./types";

export function buildEstimatePrompt(state: WizardState): string {
  const { onboarding, questionnaire, judo } = state;

  const judoSection =
    questionnaire.sport === "judo"
      ? `
JUDO TRAINING:
- Sessions per week: ${judo.sessionsPerWeek}
- Intensity: ${judo.intensity}
- Competition soon (within 8 weeks): ${judo.hasCompetitionSoon ? "yes" : "no"}
- Weekly session log: ${judo.weeklySessionLog || "not provided"}
`
      : "";

  return `You are an experienced, evidence-based fitness coach. You give realistic, honest estimates — never false promises.

USER PROFILE:
- Name: ${onboarding.name}
- Age: ${onboarding.age}
- Sex: ${onboarding.sex}
- Height: ${onboarding.heightCm} cm
- Weight: ${onboarding.weightKg} kg
- Training experience: ${onboarding.experience}
- Activity level: ${onboarding.activityLevel}

GOAL:
- Goal type: ${questionnaire.goalType}
- Workout setting: ${questionnaire.workoutSetting}
- Injuries/limitations: ${questionnaire.injuries || "none reported"}
- Sport: ${questionnaire.sport}
${judoSection}
PHOTO CONTEXT:
The user has uploaded a current body photo and a goal physique photo. Acknowledge that the goal photo may show different genetics, lighting, or editing. Do not over-promise based on photos.

TASK:
Return a JSON object with this exact structure. Do not include any text outside the JSON.

{
  "timeframeMin": <integer months>,
  "timeframeMax": <integer months>,
  "timeframeUnit": "months",
  "confidenceLevel": "low" | "medium" | "high",
  "reasoning": [<3-5 short bullet strings explaining the estimate>],
  "trainingGuidance": [<3-5 short bullet strings about weekly training structure>],
  "nutritionNote": "<1-2 sentence high-level nutrition guidance — NOT a meal plan, NOT calorie counting>",
  "disclaimer": "This estimate is for general guidance only. It is not medical advice and does not replace a doctor, physiotherapist, registered dietitian, or qualified coach."
}

Rules:
- timeframeMin and timeframeMax must form a realistic range (e.g. 6 and 12), never exact
- confidenceLevel reflects how complete the data is and how predictable the goal is
- reasoning must be honest and mention limiting factors (genetics, consistency, recovery)
- If injuries are reported, note the recommendation to see a physiotherapist
- If judo sport is selected, factor judo fatigue into training guidance
- Wording must be cautious, supportive, and non-medical
- Never claim the app can perfectly predict body transformation`;
}
