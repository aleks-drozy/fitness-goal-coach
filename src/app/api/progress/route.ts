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

  const body = await req.json();
  const { weekNumber, currentWeight, notes } = body;

  if (
    !Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 520 ||
    typeof currentWeight !== "number" || currentWeight < 20 || currentWeight > 500 ||
    isNaN(currentWeight)
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const safeNotes = typeof notes === "string" ? notes.slice(0, 1000) : "";

  const [{ data: profile }, { data: previousEntries }] = await Promise.all([
    supabase.from("profiles").select("wizard_state, estimate_result").eq("id", user.id).maybeSingle(),
    supabase
      .from("progress_entries")
      .select("week_number, current_weight, notes, ai_feedback, on_track")
      .eq("user_id", user.id)
      .order("week_number", { ascending: true }),
  ]);

  const ws = profile?.wizard_state as WizardStateDB | null;
  const estimate = profile?.estimate_result as Record<string, unknown> | null;

  // Pull competition context for personalised feedback
  const cc = ws?.competitionContext;
  const competitionDate = cc?.competitionDate ?? null;
  const weightClass = cc?.weightClass ?? null;
  const sport = String(ws?.questionnaire?.sport ?? "none");

  const daysToComp = competitionDate
    ? Math.round((new Date(competitionDate).getTime() - Date.now()) / 86_400_000)
    : null;
  const weeksToComp = daysToComp !== null ? Math.round(daysToComp / 7) : null;

  const competitionLine =
    daysToComp !== null && daysToComp > 0
      ? `\nCompetition context: ${daysToComp} days (${weeksToComp} weeks) to competition. Target weight class: ${weightClass ?? "not set"}. Sport: ${sport}.`
      : "";

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

Original goal: ${ws?.questionnaire?.goalType ?? "general fitness"}
Original estimate: ${estimate?.timeframeMin ?? "?"}-${estimate?.timeframeMax ?? "?"} ${estimate?.timeframeUnit ?? "months"}
Starting weight: ${ws?.onboarding?.weightKg ?? "unknown"}kg${competitionLine}

Previous check-ins:
${prevText}

Current check-in (Week ${weekNumber}):
Weight: ${currentWeight}kg
Notes: "${safeNotes}"

${
  daysToComp !== null && daysToComp > 0
    ? `This athlete is in competition prep with ${daysToComp} days remaining. Frame feedback as competition prep progress, not general fitness. Reference the competition timeline where relevant. Expected controlled cut rate is 0.8–1.2kg/week during prep.`
    : "Frame feedback as general fitness progress."
}

Return ONLY valid JSON (no markdown fences):
{
  "on_track": true or false,
  "revised_estimate": "X-Y months" or "On track with original estimate",
  "feedback": "4-6 sentences of specific, evidence-based coaching feedback. Reference their actual weight numbers and trajectory. If they shared notes, respond directly to what they said. If they are in competition prep, reference the competition timeline. Give one concrete action to take this week. Be direct but supportive — not generic."
}`;

  let completion;
  try {
    completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 1024,
    });
  } catch (err) {
    console.error("[/api/progress] Groq error:", err);
    return NextResponse.json({ error: "AI service temporarily unavailable. Please try again." }, { status: 500 });
  }

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

  // Supabase insert only runs after a successful Groq response
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

  // Auto-plan regen: deviation check
  // For athletes in active comp prep (<8 weeks out), acceptable loss rate is 0.8–1.2kg/week.
  // For general fitness, use original 0.5kg/week threshold.
  let planUpdated = false;

  if (weekNumber >= 4 && estimate && ws) {
    const startWeight = ws.onboarding?.weightKg;
    const goalType = ws.questionnaire?.goalType;
    const workoutSetting = String(ws.questionnaire?.workoutSetting ?? "gym");
    const timeframeMax = (estimate as Record<string, unknown> & { timeframeMax?: number })?.timeframeMax;

    if (startWeight && timeframeMax) {
      const isCompPrepPhase = weeksToComp !== null && weeksToComp <= 8 && weeksToComp > 0;

      // Use a wider acceptable rate during competition prep — weekly cuts of 0.8–1.2kg are expected
      const expectedWeeklyDelta = isCompPrepPhase
        ? -1.0
        : goalType === "fat_loss" ? -0.5 : goalType === "muscle_gain" ? 0.25 : -0.25;

      const expectedWeight = startWeight + expectedWeeklyDelta * weekNumber;
      const totalProgrammeChange = Math.abs(expectedWeeklyDelta * timeframeMax * 4.33) || 1;
      const deviation = Math.abs(currentWeight - expectedWeight) / totalProgrammeChange;

      if (deviation > 0.1) {
        const isGrappling = GRAPPLING_SPORTS.has(sport);
        const exercisePool = buildExercisePool(isGrappling, workoutSetting);

        const compLine = isCompPrepPhase
          ? `\nCompetition in ${weeksToComp} weeks — target class: ${weightClass ?? "unknown"}. Periodize toward taper.`
          : "";

        const planPrompt = `You are an expert fitness coach. A user's progress is deviating from their plan. Update their training plan.

User goal: ${goalType ?? "general fitness"}
Sport: ${sport}
Starting weight: ${startWeight}kg
Expected weight at week ${weekNumber}: ${expectedWeight.toFixed(1)}kg
Actual weight: ${currentWeight}kg
Deviation: ${(deviation * 100).toFixed(0)}%${compLine}
${exercisePool}

IMPORTANT: Use exercise names exactly as they appear in the library above. Do not invent exercise names not listed.

Return ONLY valid JSON (no markdown fences) matching exactly:
{
  "weekly_schedule": [{ "day": "string", "focus": "string", "exercises": ["string"] }],
  "nutrition": { "calories_guidance": "string", "protein_target": "string", "meal_timing": "string" },
  "judo_specific": ${isGrappling ? `{ "technical_focus": "string", "conditioning_priority": "string" }` : "null"},
  "recovery": { "sleep": "string", "active_recovery": "string" },
  "periodization_notes": "string or null"
}`;

        let planCompletion;
        try {
          planCompletion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: planPrompt }],
            temperature: 0.4,
            max_tokens: 2048,
          });
        } catch (err) {
          console.error("[/api/progress] Groq plan regen error:", err);
          // Best-effort — skip plan regen if Groq fails
        }

        if (planCompletion) {
          const planRaw = (planCompletion.choices[0].message.content ?? "")
            .trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");

          try {
            const newPlan = JSON.parse(planRaw);
            await supabase.from("fitness_plans").insert({ user_id: user.id, plan: newPlan });
            planUpdated = true;
          } catch {
            // best-effort
          }
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
