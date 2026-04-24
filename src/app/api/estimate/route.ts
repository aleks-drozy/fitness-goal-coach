import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildEstimatePrompt } from "@/lib/prompts";
import { WizardState, EstimateResult } from "@/lib/types";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const body = await req.json() as { state: WizardState };
  const { state } = body;

  const prompt = buildEstimatePrompt(state);

  const images: Anthropic.ImageBlockParam[] = [];

  if (state.photos.currentPhotoBase64) {
    const base64Data = state.photos.currentPhotoBase64.split(",")[1];
    images.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/jpeg",
        data: base64Data,
      },
    });
  }

  if (state.photos.goalPhotoBase64) {
    const base64Data = state.photos.goalPhotoBase64.split(",")[1];
    images.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/jpeg",
        data: base64Data,
      },
    });
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          ...images,
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const rawText = (message.content[0] as Anthropic.TextBlock).text;

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
