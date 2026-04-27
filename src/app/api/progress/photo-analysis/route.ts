import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: last } = await supabase
    .from("photo_analyses")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (last) {
    const hoursSince = (Date.now() - new Date(last.created_at).getTime()) / 3_600_000;
    if (hoursSince < 24) {
      const hoursLeft = Math.ceil(24 - hoursSince);
      return NextResponse.json({ error: `Analysis cooldown active. Try again in ${hoursLeft}h.` }, { status: 429 });
    }
  }

  let week1Path: string, currentPath: string;
  try {
    ({ week1Path, currentPath } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!week1Path || !currentPath) {
    return NextResponse.json({ error: "Both image paths required" }, { status: 400 });
  }
  // Prevent accessing other users' photos — paths must be scoped to this user's folder
  const userPrefix = `${user.id}/`;
  if (!week1Path.startsWith(userPrefix) || !currentPath.startsWith(userPrefix)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const service = createServiceClient();
  const [signed1, signed2] = await Promise.all([
    service.storage.from("progress-photos").createSignedUrl(week1Path, 60),
    service.storage.from("progress-photos").createSignedUrl(currentPath, 60),
  ]);

  if (signed1.error || signed2.error) {
    return NextResponse.json({ error: "Failed to generate signed URLs" }, { status: 500 });
  }

  const completion = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are a PhD-level personal trainer and sports scientist. You have been provided two progress photos of the same person: an earlier photo (Week 1) and a more recent photo (Current).

Assess the visible body composition changes between the two photos. Be specific about what you can and cannot determine from photos alone. Address: visible muscle definition changes, estimated body fat % change direction, overall physique trajectory.

Then state whether the person appears on track for typical body recomposition goals, and if the visual evidence warrants a revised timeline estimate, provide one (e.g. "6-10 months").

Return ONLY valid JSON (no markdown fences):
{
  "analysis": "3-5 paragraphs of honest, specific, evidence-based analysis",
  "revised_estimate": "X-Y months or null if unchanged"
}`,
          },
          { type: "image_url", image_url: { url: signed1.data.signedUrl } },
          { type: "image_url", image_url: { url: signed2.data.signedUrl } },
        ],
      },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });

  const raw = (completion.choices[0].message.content ?? "")
    .trim()
    .replace(/^```json\n?/, "")
    .replace(/\n?```$/, "");

  let parsed: { analysis: string; revised_estimate: string | null };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  await supabase.from("photo_analyses").insert({
    user_id: user.id,
    week1_url: week1Path,
    current_url: currentPath,
    analysis: parsed.analysis,
    revised_estimate: parsed.revised_estimate,
  });

  return NextResponse.json(parsed);
}
