import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

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

  const ws = profile?.wizard_state as Record<string, unknown> | null;
  const onboarding = (ws?.onboarding ?? {}) as Record<string, unknown>;
  const questionnaire = (ws?.questionnaire ?? {}) as Record<string, unknown>;
  const judo = (ws?.judo ?? {}) as Record<string, unknown>;

  const isJudo = questionnaire.sport === "judo";
  const judoLine = isJudo
    ? `\nJudo: ${judo.sessionsPerWeek} sessions/week, ${judo.intensity} intensity${judo.hasCompetitionSoon ? ", competition within 8 weeks" : ""}`
    : "";

  const prompt = `You are an expert fitness and strength coach. Create a detailed, personalized weekly training plan.

User profile:
- Goal: ${questionnaire.goalType ?? "general fitness"}
- Sport: ${questionnaire.sport ?? "none"}${judoLine}
- Experience: ${onboarding.experience ?? "intermediate"}
- Activity level: ${onboarding.activityLevel ?? "moderate"}
- Age: ${onboarding.age ?? "unknown"}, Sex: ${onboarding.sex ?? "unknown"}
- Current weight: ${onboarding.weightKg ?? "unknown"}kg
- Workout setting: ${questionnaire.workoutSetting ?? "gym"}
- Injuries/limitations: ${questionnaire.injuries || "none"}

Return ONLY valid JSON (no markdown fences):
{
  "weekly_schedule": [
    { "day": "Day name", "focus": "Session focus", "exercises": ["Exercise with sets/reps", "Exercise with sets/reps"] }
  ],
  "nutrition": {
    "calories_guidance": "Concise calorie strategy for their goal",
    "protein_target": "Daily protein target with rationale",
    "meal_timing": "When to eat relative to training"
  },
  "judo_specific": ${isJudo ? '{ "technical_focus": "Which judo techniques to prioritize", "conditioning_priority": "Specific conditioning focus" }' : "null"},
  "recovery": {
    "sleep": "Sleep recommendation",
    "active_recovery": "Active recovery activities"
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
