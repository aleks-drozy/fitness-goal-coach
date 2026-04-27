import { createClient } from "@/lib/supabase/server";
import { PhotoComparison } from "@/components/progress/PhotoComparison";

export default async function PhotosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: lastAnalysis } = await supabase
    .from("photo_analyses")
    .select("created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-lg space-y-8">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--primary)" }}>Progress photos</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Photo comparison</h1>
          <p className="mt-1.5 text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
            Upload two photos for side-by-side comparison and AI body composition analysis. Analysis has a 24-hour cooldown.
          </p>
          {lastAnalysis && (
            <p className="mt-2 text-[0.75rem]" style={{ color: "var(--muted-foreground)" }}>
              Last analysis: {new Date(lastAnalysis.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
        <PhotoComparison userId={user!.id} />
      </div>
    </div>
  );
}
