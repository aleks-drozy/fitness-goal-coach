import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";
import { buildExercisePool, GRAPPLING_SPORTS } from "@/lib/exercises";
import type { WizardStateDB } from "@/lib/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("wizard_state")
    .eq("id", user.id)
    .maybeSingle();

  const ws = profile?.wizard_state as WizardStateDB | null;
  const onboarding = ws?.onboarding ?? {};
  const questionnaire = ws?.questionnaire ?? {};
  const judo = ws?.judo ?? {};
  const cc = ws?.competitionContext ?? {};

  const sport = String(questionnaire.sport ?? "none");
  const isGrappling = GRAPPLING_SPORTS.has(sport);
  const workoutSetting = String(questionnaire.workoutSetting ?? "gym");

  const daysToComp = cc.competitionDate
    ? Math.round((new Date(cc.competitionDate).getTime() - Date.now()) / 86_400_000)
    : null;
  const weeksToComp = daysToComp !== null ? Math.round(daysToComp / 7) : null;

  const grapplingLine = isGrappling
    ? `\nGrappling sport (${sport}): ${judo.sessionsPerWeek} sessions/week, ${judo.intensity} intensity${judo.hasCompetitionSoon ? ", competition within 8 weeks" : ""}`
    : "";

  const competitionLine =
    daysToComp !== null && daysToComp > 0
      ? `\nCompetition: ${daysToComp} days (${weeksToComp} weeks) away. Target weight class: ${cc.weightClass ?? "not specified"}.`
      : "";

  const periodizationInstruction =
    daysToComp !== null && weeksToComp !== null && weeksToComp > 0
      ? `\nPeriodize the plan toward the competition in ${weeksToComp} weeks. Example structure:
${weeksToComp >= 12 ? "- Weeks 1–4: Strength emphasis (heavy compound lifts, volume)\n- Weeks 5–8: Conditioning emphasis (aerobic base, lactate threshold)\n- Weeks 9–12: Taper (reduce volume 30–40%, maintain intensity)" : ""}
${weeksToComp >= 8 && weeksToComp < 12 ? "- Weeks 1–4: Conditioning emphasis\n- Weeks 5–8: Taper and sharpen" : ""}
${weeksToComp >= 4 && weeksToComp < 8 ? "- Weeks 1–3: Moderate conditioning, maintain strength\n- Week 4+: Begin taper" : ""}
${weeksToComp < 4 ? "- Final prep phase: reduce volume, maintain intensity, prioritise recovery" : ""}
Add a "periodization_notes" field to the JSON with a 2-3 sentence overview of this periodization.`
      : '\nSet "periodization_notes" to null in the response.';

  const exercisePool = buildExercisePool(isGrappling, workoutSetting);

  const prompt = `You are an expert fitness and strength coach. Create a detailed, personalized weekly training plan.

User profile:
- Goal: ${questionnaire.goalType ?? "general fitness"}
- Sport: ${sport}${grapplingLine}${competitionLine}
- Experience: ${onboarding.experience ?? "intermediate"}
- Activity level: ${onboarding.activityLevel ?? "moderate"}
- Age: ${onboarding.age ?? "unknown"}, Sex: ${onboarding.sex ?? "unknown"}
- Current weight: ${onboarding.weightKg ?? "unknown"}kg
- Workout setting: ${workoutSetting}
- Injuries/limitations: ${questionnaire.injuries || "none"}
${exercisePool}
${periodizationInstruction}

IMPORTANT: Use exercise names exactly as they appear in the library above. Do not invent exercise names not listed. Format each exercise as "Exercise Name — sets×reps" or "Exercise Name — duration".

Return ONLY valid JSON (no markdown fences):
{
  "sport": "${sport}",
  "weekly_schedule": [
    { "day": "Day name", "focus": "Session focus", "exercises": ["Exercise Name — 3×8-10", "Exercise Name — 30-60s"] }
  ],
  "nutrition": {
    "calories_guidance": "Concise calorie strategy for their goal",
    "protein_target": "Daily protein target with rationale",
    "meal_timing": "When to eat relative to training"
  },
  "judo_specific": ${isGrappling ? `{ "technical_focus": "Which techniques to prioritize for ${sport}", "conditioning_priority": "Specific conditioning focus for ${sport}" }` : "null"},
  "recovery": {
    "sleep": "Sleep recommendation",
    "active_recovery": "Active recovery activities from the library"
  },
  "periodization_notes": "2-3 sentence overview of the periodization toward the competition, or null"
}`;

  let completion;
  try {
    completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 2048,
    });
  } catch (err) {
    console.error("[/api/plan] Groq error:", err);
    return NextResponse.json({ error: "AI service temporarily unavailable. Please try again." }, { status: 500 });
  }

  const rawText = (completion.choices[0].message.content ?? "")
    .trim()
    .replace(/^```json\n?/, "")
    .replace(/\n?```$/, "");

  let plan: Record<string, unknown>;
  try {
    plan = JSON.parse(rawText);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const { data: saved, error: insertError } = await supabase
    .from("fitness_plans")
    .insert({ user_id: user.id, plan })
    .select("id, plan, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ plan: saved.plan });
}
