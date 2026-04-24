import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { buildEstimatePrompt } from "@/lib/prompts";
import { WizardState, EstimateResult } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.json() as { state: WizardState };
  const { state } = body;

  const prompt = buildEstimatePrompt(state);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const parts: Part[] = [];

  if (state.photos.currentPhotoBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: state.photos.currentPhotoBase64.split(",")[1],
      },
    });
  }

  if (state.photos.goalPhotoBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: state.photos.goalPhotoBase64.split(",")[1],
      },
    });
  }

  parts.push({ text: prompt });

  const response = await model.generateContent(parts);
  const rawText = response.response.text().trim()
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
