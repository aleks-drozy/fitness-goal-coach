import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = user.id;
  const service = createServiceClient();

  // Delete in dependency order (FK constraints)
  await service.from("photo_analyses").delete().eq("user_id", userId);
  await service.from("progress_entries").delete().eq("user_id", userId);
  await service.from("fitness_plans").delete().eq("user_id", userId);
  await service.from("profiles").delete().eq("id", userId);

  // Delete storage files
  const { data: files } = await service.storage.from("progress-photos").list(userId);
  if (files && files.length > 0) {
    const paths = files.map((f: { name: string }) => `${userId}/${f.name}`);
    await service.storage.from("progress-photos").remove(paths);
  }

  // Delete auth user (must be last)
  const { error } = await service.auth.admin.deleteUser(userId);
  if (error) return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });

  return NextResponse.json({ success: true });
}
