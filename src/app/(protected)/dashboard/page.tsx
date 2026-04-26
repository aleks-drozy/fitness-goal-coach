import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { FeedbackCallout } from "@/components/dashboard/FeedbackCallout";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: entries }, { data: latestPlan }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("wizard_state, estimate_result")
        .eq("id", user!.id)
        .maybeSingle(),
      supabase
        .from("progress_entries")
        .select("*")
        .eq("user_id", user!.id)
        .order("week_number", { ascending: true }),
      supabase
        .from("fitness_plans")
        .select("id")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const estimate = profile?.estimate_result as {
    timeframeMin: number;
    timeframeMax: number;
    timeframeUnit: string;
    confidenceLevel: "low" | "medium" | "high";
  } | null;

  const sortedEntries = (entries ?? []) as Array<{
    id: string;
    week_number: number;
    current_weight: number;
    notes: string | null;
    ai_feedback: string | null;
    on_track: boolean | null;
    created_at: string;
  }>;

  const latestEntry =
    sortedEntries.length > 0 ? sortedEntries[sortedEntries.length - 1] : null;

  const chartData = sortedEntries.map((e) => ({
    week: e.week_number,
    weight: e.current_weight,
  }));

  const hasPlan = !!latestPlan;
  const hasWizardData = !!profile?.wizard_state;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Header */}
        <div>
          <p
            className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
            style={{ color: "var(--primary)" }}
          >
            Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Your progress
          </h1>
        </div>

        {/* Summary */}
        <SummaryCard estimate={estimate} latestEntry={latestEntry} />

        {/* Weight chart */}
        {chartData.length > 1 && (
          <div
            className="rounded-[var(--r-card)] border p-5 space-y-4"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <p
              className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
              style={{ color: "var(--primary)" }}
            >
              Weight over time
            </p>
            <ProgressChart data={chartData} />
          </div>
        )}

        {/* Latest feedback */}
        {latestEntry?.ai_feedback && (
          <FeedbackCallout
            weekNumber={latestEntry.week_number}
            feedback={latestEntry.ai_feedback}
            onTrack={latestEntry.on_track}
          />
        )}

        {/* Quick links */}
        <div
          className="rounded-[var(--r-card)] border p-5 space-y-3"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <p
            className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
            style={{ color: "var(--muted-foreground)" }}
          >
            Quick actions
          </p>
          <div className="grid grid-cols-1 gap-2">
            <Link
              href="/progress"
              className={cn(buttonVariants({ size: "lg" }), "w-full")}
            >
              Log this week →
            </Link>
            <Link
              href="/plan"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "w-full"
              )}
            >
              {hasPlan ? "View training plan" : "Generate training plan"}
            </Link>
            {!hasWizardData && (
              <Link
                href="/coach"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "default" }),
                  "w-full"
                )}
              >
                Re-run fitness wizard
              </Link>
            )}
          </div>
        </div>

        {/* Empty state: no wizard data */}
        {!hasWizardData && (
          <div
            className="rounded-[var(--r-card)] border p-6 text-center"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <p className="text-[0.875rem] font-medium">Complete your profile</p>
            <p
              className="mt-1 text-[0.8125rem]"
              style={{ color: "var(--muted-foreground)" }}
            >
              Run the fitness wizard to get your personalized estimate and unlock
              plan generation.
            </p>
            <Link
              href="/coach"
              className={cn(buttonVariants({ size: "sm" }), "mt-4")}
            >
              Start wizard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
