import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { FeedbackCallout } from "@/components/dashboard/FeedbackCallout";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CompetitionContext, OnboardingData } from "@/lib/types";

function parseEstimate(raw: unknown): {
  timeframeMin: number;
  timeframeMax: number;
  timeframeUnit: string;
  confidenceLevel: "low" | "medium" | "high";
} | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.timeframeMin !== "number" || typeof r.timeframeMax !== "number") return null;
  return {
    timeframeMin: r.timeframeMin,
    timeframeMax: r.timeframeMax,
    timeframeUnit: typeof r.timeframeUnit === "string" ? r.timeframeUnit : "months",
    confidenceLevel: (r.confidenceLevel as "low" | "medium" | "high") ?? "medium",
  };
}

function parseCompetitionContext(ws: unknown): CompetitionContext | null {
  if (!ws || typeof ws !== "object") return null;
  const r = ws as Record<string, unknown>;
  const cc = r.competitionContext as Partial<CompetitionContext> | undefined;
  if (!cc) return null;
  return {
    isActivelyCompeting: Boolean(cc.isActivelyCompeting),
    weightClass: cc.weightClass ?? null,
    competitionDate: cc.competitionDate ?? null,
  };
}

function parseOnboarding(ws: unknown): Partial<OnboardingData> | null {
  if (!ws || typeof ws !== "object") return null;
  const r = ws as Record<string, unknown>;
  return (r.onboarding as Partial<OnboardingData>) ?? null;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  const estimate = parseEstimate(profile?.estimate_result);
  const competitionCtx = parseCompetitionContext(profile?.wizard_state);
  const onboardingData = parseOnboarding(profile?.wizard_state);

  const sortedEntries = (entries ?? []) as Array<{
    id: string;
    week_number: number;
    current_weight: number;
    notes: string | null;
    ai_feedback: string | null;
    on_track: boolean | null;
    created_at: string;
  }>;

  const latestEntry = sortedEntries.length > 0 ? sortedEntries[sortedEntries.length - 1] : null;
  const chartData = sortedEntries.map((e) => ({ week: e.week_number, weight: e.current_weight }));

  const hasPlan = !!latestPlan;
  const hasWizardData = !!profile?.wizard_state;

  const weeksLogged = sortedEntries.length;
  const totalEstimateWeeks = estimate
    ? Math.round(((estimate.timeframeMin + estimate.timeframeMax) / 2) * 4.33)
    : 0;
  const milestonePct = totalEstimateWeeks > 0
    ? Math.min(100, Math.round((weeksLogged / totalEstimateWeeks) * 100))
    : 0;

  // Competition countdown calculations
  const compDate = competitionCtx?.competitionDate;
  const compWeightClass = competitionCtx?.weightClass;
  const currentWeight = onboardingData?.weightKg ?? latestEntry?.current_weight ?? null;

  const daysToComp = compDate
    ? Math.round((new Date(compDate).getTime() - Date.now()) / 86_400_000)
    : null;

  const kgToComp =
    currentWeight && compWeightClass && typeof compWeightClass === "number"
      ? Math.max(0, currentWeight - compWeightClass)
      : null;

  const hasCompetition = daysToComp !== null && daysToComp > 0;
  const isFinalPrep = hasCompetition && daysToComp !== null && daysToComp <= 28;

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

        {/* Competition countdown — replaces milestone when date is set */}
        {hasCompetition ? (
          <div className="space-y-3">
            {/* Amber warning for final prep phase */}
            {isFinalPrep && (
              <div
                className="rounded-[var(--r-card)] border p-4"
                style={{ borderColor: "var(--warn, oklch(0.75 0.15 80))", background: "oklch(0.75 0.15 80 / 8%)" }}
              >
                <p className="text-[0.8125rem] font-semibold" style={{ color: "var(--warn, oklch(0.6 0.15 80))" }}>
                  Final prep phase
                </p>
                <p className="text-[0.8125rem]" style={{ color: "var(--warn, oklch(0.6 0.15 80))" }}>
                  Prioritise recovery and weight management in these final weeks.
                </p>
              </div>
            )}

            <div
              className="rounded-[var(--r-card)] border p-5 space-y-4"
              style={{ borderColor: "var(--primary)", background: "var(--accent-dim)" }}
            >
              <p
                className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
                style={{ color: "var(--primary)" }}
              >
                {daysToComp} days to competition
                {compWeightClass ? ` · ${kgToComp !== null ? kgToComp.toFixed(1) : "?"}kg to ${compWeightClass}kg` : ""}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-[var(--r-card)] border p-3 text-center"
                  style={{ borderColor: "var(--border)", background: "var(--background)" }}
                >
                  <p className="text-2xl font-bold" style={{ color: "var(--primary)" }}>
                    {daysToComp}
                  </p>
                  <p className="text-[0.75rem] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    days remaining
                  </p>
                </div>
                {kgToComp !== null && (
                  <div
                    className="rounded-[var(--r-card)] border p-3 text-center"
                    style={{ borderColor: "var(--border)", background: "var(--background)" }}
                  >
                    <p className="text-2xl font-bold" style={{ color: "var(--primary)" }}>
                      {kgToComp.toFixed(1)}
                    </p>
                    <p className="text-[0.75rem] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      kg to cut
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Standard milestone progress when no competition date */
          weeksLogged > 0 && estimate && (
            <div
              className="rounded-[var(--r-card)] border p-5 space-y-3"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <p
                className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
                style={{ color: "var(--primary)" }}
              >
                Progress milestone
              </p>
              <div className="flex items-center justify-between">
                <p className="text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
                  {weeksLogged} week{weeksLogged !== 1 ? "s" : ""} logged
                </p>
                <p className="text-[0.875rem] font-semibold" style={{ color: "var(--foreground)" }}>
                  {milestonePct}% of estimate
                </p>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${milestonePct}%`, background: "var(--primary)" }}
                />
              </div>
              {weeksLogged >= 12 && (
                <p className="text-[0.8125rem]" style={{ color: "var(--success)" }}>
                  Exceptional commitment — 12+ weeks in.
                </p>
              )}
              {weeksLogged >= 8 && weeksLogged < 12 && (
                <p className="text-[0.8125rem]" style={{ color: "var(--success)" }}>
                  8 weeks strong. You&apos;re building a real habit.
                </p>
              )}
              {weeksLogged >= 4 && weeksLogged < 8 && (
                <p className="text-[0.8125rem]" style={{ color: "var(--success)" }}>
                  4 weeks consistent. Keep the momentum.
                </p>
              )}
            </div>
          )
        )}

        {/* Weight chart */}
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
          {chartData.length >= 2 ? (
            <ProgressChart data={chartData} />
          ) : (
            <p className="text-[0.875rem] py-6 text-center" style={{ color: "var(--muted-foreground)" }}>
              {chartData.length === 0
                ? "Log your first check-in to start tracking."
                : "Log one more week to see your weight trend."}
            </p>
          )}
        </div>

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
            <Link href="/progress" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
              Log this week →
            </Link>
            <Link
              href="/plan"
              className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full")}
            >
              {hasPlan ? "View training plan" : "Generate training plan"}
            </Link>
            {!hasWizardData && (
              <Link
                href="/coach"
                className={cn(buttonVariants({ variant: "ghost", size: "default" }), "w-full")}
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
            <p className="mt-1 text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>
              Run the fitness wizard to get your personalized estimate and unlock plan generation.
            </p>
            <Link href="/coach" className={cn(buttonVariants({ size: "sm" }), "mt-4")}>
              Start wizard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
