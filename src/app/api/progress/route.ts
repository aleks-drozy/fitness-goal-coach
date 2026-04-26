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

  const { weekNumber, currentWeight, notes } = await req.json();

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
Notes: "${notes}"

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
      notes,
      ai_feedback: groqResponse.feedback,
      on_track: groqResponse.on_track,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ...entry, revised_estimate: groqResponse.revised_estimate });
}
