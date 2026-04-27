import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: entries }, { data: plans }, { data: profile }, { data: analyses }] =
    await Promise.all([
      supabase.from("progress_entries").select("*").eq("user_id", user.id),
      supabase.from("fitness_plans").select("*").eq("user_id", user.id),
      supabase.from("profiles").select("wizard_state, estimate_result, created_at").eq("id", user.id).maybeSingle(),
      supabase.from("photo_analyses").select("created_at, analysis, revised_estimate").eq("user_id", user.id),
    ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    account: { email: user.email, created_at: user.created_at },
    profile,
    progress_entries: entries ?? [],
    fitness_plans: plans ?? [],
    photo_analyses: analyses ?? [],
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="fitness-coach-export-${Date.now()}.json"`,
    },
  });
}
