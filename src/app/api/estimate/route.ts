import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { buildEstimatePrompt } from "@/lib/prompts";
import { WizardState, EstimateResult } from "@/lib/types";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// This route is intentionally public (wizard runs before account creation).
// Abuse mitigation: set a spending cap in the Groq dashboard, and enforce a
// request body size limit so the prompt can't be bloated arbitrarily.
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  // Reject oversized payloads (wizard state should never exceed ~10 KB)
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 10_000) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  const body = await req.json() as { state: WizardState };
  const { state } = body;

  const prompt = buildEstimatePrompt(state);

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 1024,
  });

  const rawText = (completion.choices[0].message.content ?? "").trim()
    .replace(/^```json\n?/, "")
    .replace(/\n?```$/, "");

  let result: EstimateResult;
  try {
    result = JSON.parse(rawText);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse estimate from AI response" },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}
