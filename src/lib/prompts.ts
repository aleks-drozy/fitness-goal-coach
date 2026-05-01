import { WizardState } from "./types";

const GRAPPLING_SPORTS = new Set(["judo", "bjj", "wrestling", "mma"]);

function sportSpecificNotes(sport: string): string {
  switch (sport) {
    case "bjj":
      return "BJJ note: account for gi vs nogi weight difference (~1–2kg gi weight). Competition weigh-ins are typically same-day.";
    case "wrestling":
      return "Wrestling note: weigh-ins are same-day. Aggressive water cuts are common but risky — flag if cut exceeds 3% bodyweight in final 24h.";
    case "mma":
      return "MMA note: weigh-ins are typically 24h before competition, allowing rehydration. Cuts over 8–10% are high risk and increasingly restricted by commissions.";
    case "judo":
    default:
      return "Judo note: randori, uchikomi, and grip fighting create high CNS load. Caloric deficit should be modest (250–400 kcal/day) during heavy training weeks to preserve technical performance.";
  }
}

export function buildEstimatePrompt(state: WizardState): string {
  const { onboarding, questionnaire, judo, competitionContext } = state;
  const sport = questionnaire.sport;
  const isGrappling = GRAPPLING_SPORTS.has(sport);

  const daysToComp = competitionContext?.competitionDate
    ? Math.round((new Date(competitionContext.competitionDate).getTime() - Date.now()) / 86_400_000)
    : null;

  const weeksToComp = daysToComp !== null ? Math.round(daysToComp / 7) : null;

  const pctCutNeeded =
    competitionContext?.weightClass &&
    typeof competitionContext.weightClass === "number" &&
    onboarding.weightKg
      ? (onboarding.weightKg - competitionContext.weightClass) / onboarding.weightKg
      : null;

  const combatSportSection = isGrappling
    ? `
COMBAT SPORT CONTEXT:
- Sport: ${sport}
- Weight class target: ${competitionContext?.weightClass ?? "not specified"}
- Days to competition: ${daysToComp ?? "no competition date set"}
- Sessions per week: ${judo.sessionsPerWeek ?? "unknown"}
- Session intensity: ${judo.intensity ?? "unknown"}
- Competition within 8 weeks: ${judo.hasCompetitionSoon ? "yes" : "no"}
- Weekly session log: ${judo.weeklySessionLog || "not provided"}

When generating the estimate:
${
  daysToComp !== null && daysToComp > 0
    ? `- Competition date is set: ${daysToComp} days (${weeksToComp} weeks) away. Anchor the timeline to this date — do not give a generic month range. State whether the cut is safe and achievable given the time available.`
    : "- No competition date set. Give a realistic monthly estimate."
}
- Account for cumulative fatigue from grappling: randori, uchikomi, and live rolling create high CNS load. Caloric deficit should be modest (250–400 kcal/day) during heavy training weeks to preserve performance.
${
  pctCutNeeded !== null && pctCutNeeded > 0.05 && daysToComp !== null && daysToComp < 56
    ? `- HIGH RISK: The user needs to lose ${(pctCutNeeded * 100).toFixed(1)}% of bodyweight in ${weeksToComp} weeks. Flag this explicitly in the reasoning with a specific warning. Do not recommend aggressive deficits during competition prep.`
    : "- Do not recommend aggressive deficits during competition prep."
}
- ${sportSpecificNotes(sport)}
${
  daysToComp !== null && daysToComp > 0 && competitionContext?.weightClass
    ? `- Output the estimate as: "You can safely reach ${competitionContext.weightClass}kg by [date] following this protocol" — not as a generic month range.`
    : ""
}
`
    : sport !== "none"
    ? `
SPORT TRAINING:
- Sport: ${sport}
- Factor sport-specific fatigue and recovery into training load calculations.
`
    : "";

  const bodyFatLine = questionnaire.bodyFatPercent
    ? `- Body fat %: ${questionnaire.bodyFatPercent}% (use this to refine lean mass estimate and adjust caloric deficit recommendation accordingly)`
    : `- Body fat %: not provided`;

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
${targetWeightLine}${bodyFatLine}
- Training experience: ${onboarding.experience}
- Activity level: ${onboarding.activityLevel}

GOAL:
- Goal type: ${questionnaire.goalType}
- Workout setting: ${questionnaire.workoutSetting}
- Injuries/limitations: ${questionnaire.injuries || "none reported"}
- Sport: ${questionnaire.sport}
${combatSportSection}
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
- If competition date is set, anchor the estimate to that date
- Wording must be cautious, supportive, and non-medical
- Never claim the app can perfectly predict body transformation`;
}
