import { createClient } from "@/lib/supabase/server";
import { ProgressForm } from "@/components/progress/ProgressForm";
import { EntryTimeline } from "@/components/progress/EntryTimeline";

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: entries } = await supabase
    .from("progress_entries")
    .select("*")
    .eq("user_id", user!.id)
    .order("week_number", { ascending: true });

  const nextWeek =
    entries && entries.length > 0
      ? Math.max(...entries.map((e) => e.week_number as number)) + 1
      : 1;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-lg space-y-8">
        <div>
          <p
            className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
            style={{ color: "var(--primary)" }}
          >
            Progress
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Weekly check-in</h1>
          <p className="mt-1.5 text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
            Log your weight and how the week went. Your AI coach will review your trajectory.
          </p>
        </div>

        <ProgressForm nextWeek={nextWeek} />

        {entries && entries.length > 0 && (
          <EntryTimeline entries={entries} />
        )}

        {(!entries || entries.length === 0) && (
          <div
            className="rounded-[var(--r-card)] border p-8 text-center"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <p className="text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
              No check-ins yet. Log your first week above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
