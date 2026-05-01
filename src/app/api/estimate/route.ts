import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { buildEstimatePrompt } from "@/lib/prompts";
import { WizardState, EstimateResult } from "@/lib/types";
import { rateLimit } from "@/lib/rate-limit";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// This route is intentionally public (wizard runs before account creation).
// Abuse mitigation: set a spending cap in the Groq dashboard, and enforce a
// request body size limit so the prompt can't be bloated arbitrarily.
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const { allowed } = rateLimit(`estimate:${ip}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 50_000) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  const body = (await req.json()) as { state: WizardState };
  const { state } = body;

  const promptText = buildEstimatePrompt(state);

  let completion;
  try {
    completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: promptText }],
      temperature: 0.3,
      max_tokens: 1024,
    });
  } catch (err) {
    console.error("[/api/estimate] Groq error:", err);
    return NextResponse.json({ error: "AI service error" }, { status: 502 });
  }

  const rawText = (completion.choices[0].message.content ?? "")
    .trim()
    .replace(/^```json\n?/, "")
    .replace(/\n?```$/, "");

  let result: EstimateResult;
  try {
    result = JSON.parse(rawText);
  } catch {
    console.error("[/api/estimate] JSON parse failed. Raw:", rawText);
    return NextResponse.json(
      { error: "Failed to parse estimate from AI response" },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}
