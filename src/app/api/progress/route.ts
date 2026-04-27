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

  const body = await req.json();
  const { weekNumber, currentWeight, notes } = body;

  // Input validation — prevent garbage data from reaching the DB and Groq prompt
  if (
    !Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 520 ||
    typeof currentWeight !== "number" || currentWeight < 20 || currentWeight > 500 ||
    isNaN(currentWeight)
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  // Cap notes length to prevent prompt injection and DB abuse
  const safeNotes = typeof notes === "string" ? notes.slice(0, 1000) : "";

  const [{ data: profile }, { data: previousEntries }] = await Promise.all([
    supabase.from("profiles").select("wizard_state, estimate_result").eq("id", user.id).maybeSingle(),
    supabase
      .from("progress_entries")
      .select("week_number, current_weight, notes, ai_feedback, on_track")
      .eq("user_id", user.id)
      .order("week_number", { ascending: true }),
  ]);

  const ws = profile?.wizard_state as Record<string, unknown> | null;
  const estimate = profile?.estimate_result as Record<string, unknown> | null;

  const prevText =
    previousEntries && previousEntries.length > 0
      ? previousEntries
          .map(
            (e) =>
              `Week ${e.week_number}: ${e.current_weight}kg — Notes: "${e.notes}" | ${e.on_track ? "On track" : "Off track"} — "${e.ai_feedback}"`
          )
          .join("\n")
      : "None yet (this is their first check-in).";

  const prompt = `You are an evidence-based fitness coach. Analyze a user's weekly progress check-in.

Original goal: ${(ws?.questionnaire as Record<string, unknown>)?.goalType ?? "general fitness"}
Original estimate: ${estimate?.timeframeMin ?? "?"}-${estimate?.timeframeMax ?? "?"} ${estimate?.timeframeUnit ?? "months"}
Starting weight: ${(ws?.onboarding as Record<string, unknown>)?.weightKg ?? "unknown"}kg

Previous check-ins:
${prevText}

Current check-in (Week ${weekNumber}):
Weight: ${currentWeight}kg
Notes: "${safeNotes}"

Return ONLY valid JSON (no markdown fences):
{
  "on_track": true or false,
  "revised_estimate": "X-Y months" or "On track with original estimate",
  "feedback": "2-3 sentences of specific, honest, actionable coaching feedback based on their actual progress data"
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    max_tokens: 512,
  });

  const rawText = (completion.choices[0].message.content ?? "")
    .trim()
    .replace(/^```json\n?/, "")
    .replace(/\n?```$/, "");

  let groqResponse: { on_track: boolean; revised_estimate: string; feedback: string };
  try {
    groqResponse = JSON.parse(rawText);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const { data: entry, error: insertError } = await supabase
    .from("progress_entries")
    .insert({
      user_id: user.id,
      week_number: weekNumber,
      current_weight: currentWeight,
      notes: safeNotes,
      ai_feedback: groqResponse.feedback,
      on_track: groqResponse.on_track,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Check last 3 entries for >10% deviation from expected trajectory
  let planUpdated = false;

  const { data: last3 } = await supabase
    .from("progress_entries")
    .select("week_number, current_weight")
    .eq("user_id", user.id)
    .order("week_number", { ascending: false })
    .limit(3);

  if (last3 && last3.length >= 2 && estimate && ws) {
    const startWeight = (ws as Record<string, unknown> & { onboarding?: { weightKg?: number } })?.onboarding?.weightKg;
    const goalType = (ws as Record<string, unknown> & { questionnaire?: { goalType?: string } })?.questionnaire?.goalType;
    const timeframeMax = (estimate as Record<string, unknown> & { timeframeMax?: number })?.timeframeMax;

    if (startWeight && timeframeMax) {
      const expectedWeeklyDelta =
        goalType === "fat_loss" ? -0.5 : goalType === "muscle_gain" ? 0.25 : -0.25;
      const expectedWeight = startWeight + expectedWeeklyDelta * weekNumber;
      const totalExpectedChange = Math.abs(expectedWeight - startWeight) || 1;
      const deviation = Math.abs(currentWeight - expectedWeight) / totalExpectedChange;

      if (deviation > 0.1 && weekNumber >= 2) {
        const planPrompt = `You are an expert fitness coach. A user's progress is deviating from their plan. Update their training plan.

User goal: ${goalType ?? "general fitness"}
Starting weight: ${startWeight}kg
Expected weight at week ${weekNumber}: ${expectedWeight.toFixed(1)}kg
Actual weight: ${currentWeight}kg
Deviation: ${(deviation * 100).toFixed(0)}%

Return ONLY valid JSON (no markdown fences) matching exactly:
{
  "weekly_schedule": [{ "day": "string", "focus": "string", "exercises": ["string"] }],
  "nutrition": { "calories_guidance": "string", "protein_target": "string", "meal_timing": "string" },
  "judo_specific": null,
  "recovery": { "sleep": "string", "active_recovery": "string" }
}`;

        const planCompletion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: planPrompt }],
          temperature: 0.4,
          max_tokens: 2048,
        });

        const planRaw = (planCompletion.choices[0].message.content ?? "")
          .trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");

        try {
          const newPlan = JSON.parse(planRaw);
          await supabase.from("fitness_plans").insert({ user_id: user.id, plan: newPlan });
          planUpdated = true;
        } catch {
          // best-effort — silently skip if plan JSON parse fails
        }
      }
    }
  }

  return NextResponse.json({
    ...entry,
    revised_estimate: groqResponse.revised_estimate,
    plan_updated: planUpdated,
  });
}
