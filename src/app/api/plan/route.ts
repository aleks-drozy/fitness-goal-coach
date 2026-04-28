import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";
import exercises from "@/data/exercises.json";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

type Exercise = {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment: string;
  difficulty: string;
  sets?: number;
  reps?: string;
  duration?: string;
};

const GRAPPLING_SPORTS = new Set(["judo", "bjj", "wrestling", "mma"]);

function buildExercisePool(isGrappling: boolean, workoutSetting: string): string {
  const typed = exercises as Exercise[];

  const strength = typed
    .filter((e) => e.category === "Strength")
    .filter((e) => {
      if (workoutSetting === "home") {
        return e.equipment === "Bodyweight" || e.equipment === "Dumbbell";
      }
      return true;
    })
    .map((e) => `${e.name} (${e.sets ? `${e.sets}×` : ""}${e.reps ?? e.duration ?? ""}, ${e.equipment})`);

  const cardio = typed
    .filter((e) => e.category === "Cardio")
    .map((e) => `${e.name} (${e.sets ? `${e.sets}×` : ""}${e.duration ?? e.reps ?? ""}, ${e.equipment})`);

  const mobility = typed
    .filter((e) => e.category === "Mobility")
    .map((e) => `${e.name} (${e.duration ?? ""})`);

  const recovery = typed
    .filter((e) => e.category === "Recovery")
    .map((e) => `${e.name} (${e.duration ?? ""})`);

  let pool = `
EXERCISE LIBRARY — use these exact names in the plan so users can look them up:

Strength: ${strength.join(" | ")}

Cardio: ${cardio.join(" | ")}

Mobility: ${mobility.join(" | ")}

Recovery: ${recovery.join(" | ")}`;

  if (isGrappling) {
    const grappling = typed
      .filter((e) => e.category === "Judo Conditioning")
      .map((e) => `${e.name} (${e.sets ? `${e.sets}×` : ""}${e.reps ?? e.duration ?? ""}, ${e.equipment})`);
    pool += `\n\nGrappling Conditioning: ${grappling.join(" | ")}`;
  }

  return pool;
}

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

  const ws = profile?.wizard_state as Record<string, unknown> | null;
  const onboarding = (ws?.onboarding ?? {}) as Record<string, unknown>;
  const questionnaire = (ws?.questionnaire ?? {}) as Record<string, unknown>;
  const judo = (ws?.judo ?? {}) as Record<string, unknown>;

  const sport = String(questionnaire.sport ?? "none");
  const isGrappling = GRAPPLING_SPORTS.has(sport);
  const workoutSetting = String(questionnaire.workoutSetting ?? "gym");

  const grapplingLine = isGrappling
    ? `\nGrappling sport (${sport}): ${judo.sessionsPerWeek} sessions/week, ${judo.intensity} intensity${judo.hasCompetitionSoon ? ", competition within 8 weeks" : ""}`
    : "";

  const exercisePool = buildExercisePool(isGrappling, workoutSetting);

  const prompt = `You are an expert fitness and strength coach. Create a detailed, personalized weekly training plan.

User profile:
- Goal: ${questionnaire.goalType ?? "general fitness"}
- Sport: ${sport}${grapplingLine}
- Experience: ${onboarding.experience ?? "intermediate"}
- Activity level: ${onboarding.activityLevel ?? "moderate"}
- Age: ${onboarding.age ?? "unknown"}, Sex: ${onboarding.sex ?? "unknown"}
- Current weight: ${onboarding.weightKg ?? "unknown"}kg
- Workout setting: ${workoutSetting}
- Injuries/limitations: ${questionnaire.injuries || "none"}
${exercisePool}

IMPORTANT: Use exercise names exactly as they appear in the library above. Do not invent exercise names not listed. Format each exercise as "Exercise Name — sets×reps" or "Exercise Name — duration".

Return ONLY valid JSON (no markdown fences):
{
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
  }
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    max_tokens: 2048,
  });

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
