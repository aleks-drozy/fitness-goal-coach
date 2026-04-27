import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentWeight, targetClass, competitionDate, dietQuality, sessionsPerWeek } = await req.json();

  if (!currentWeight || !targetClass || !competitionDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const daysLeft = Math.round((new Date(competitionDate).getTime() - Date.now()) / 86_400_000);
  const kgToCut = parseFloat(currentWeight) - parseFloat(targetClass);

  if (daysLeft < 1) return NextResponse.json({ error: "Competition date must be in the future" }, { status: 400 });
  if (kgToCut <= 0) return NextResponse.json({ error: "Current weight is already at or below target class" }, { status: 400 });

  // Safety guardrail: >5% bodyweight cut in <14 days is refused
  const pctCut = kgToCut / parseFloat(currentWeight);
  if (pctCut > 0.05 && daysLeft < 14) {
    return NextResponse.json({
      safetyWarning: true,
      message: `Cutting ${kgToCut.toFixed(1)}kg (${(pctCut * 100).toFixed(1)}% of bodyweight) in ${daysLeft} days is unsafe and performance-destroying. We cannot generate a protocol for this cut. Consider competing at a higher weight class or entering a later competition.`,
    }, { status: 422 });
  }

  const prompt = `You are an expert judo-specific strength and conditioning coach with experience supporting elite athletes through competition weight cuts.

Current situation:
- Current weight: ${currentWeight}kg
- Target weight class: under ${targetClass}kg
- kg to cut: ${kgToCut.toFixed(1)}kg
- Days to competition: ${daysLeft}
- Diet quality (1-5): ${dietQuality}
- Training sessions per week: ${sessionsPerWeek}

Produce a safe, evidence-based week-by-week weight cut plan that preserves competition performance. Include a water cut protocol ONLY in the final 24-48 hours. Be conservative and performance-focused.

Return ONLY valid JSON (no markdown fences):
{
  "weeklyTargets": [
    { "week": 1, "targetWeight": 0.0, "strategy": "string", "nutrition": "string", "training": "string" }
  ],
  "nutritionGuidelines": "string",
  "hydrationProtocol": "string — water cut in final 24-48h only",
  "trainingAdjustments": "string",
  "safetyWarnings": ["string"]
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 2048,
  });

  const raw = (completion.choices[0].message.content ?? "")
    .trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");

  let plan: Record<string, unknown>;
  try { plan = JSON.parse(raw); }
  catch { return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 }); }

  await supabase.from("fitness_plans").insert({ user_id: user.id, plan: { ...plan, type: "weight_cut" } });

  return NextResponse.json({ plan, kgToCut: kgToCut.toFixed(1), daysLeft });
}
