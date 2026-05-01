import Link from "next/link";
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

  const loggedWeeks = (entries ?? []).map((e) => e.week_number as number);
  const maxWeek = loggedWeeks.length > 0 ? Math.max(...loggedWeeks) : 0;
  const nextWeek = maxWeek + 1;

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
          {process.env.NEXT_PUBLIC_PHOTOS_ENABLED === "true" && (
            <Link href="/progress/photos" className="mt-2 inline-block text-[0.8125rem]" style={{ color: "var(--primary)" }}>
              Photo comparison →
            </Link>
          )}
          <p className="mt-1.5 text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
            Log your weight and how the week went. Maken reviews your numbers and flags if you're off track.
          </p>
        </div>

        <ProgressForm nextWeek={nextWeek} loggedWeeks={loggedWeeks} />

        {entries && entries.length > 0 && (
          <EntryTimeline entries={entries} />
        )}

        {(!entries || entries.length === 0) && (
          <p className="text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
            Your weekly weigh-ins will appear here. Log week 1 above to start building your weight trajectory.
          </p>
        )}
      </div>
    </div>
  );
}
