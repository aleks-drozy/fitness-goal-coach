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
      <div className="mx-auto max-w-lg space-y-8">
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

        {/* Competition countdown — raw typographic treatment, no nested mini-cards */}
        {hasCompetition ? (
          <div className="space-y-4">
            {isFinalPrep && (
              <div
                className="rounded-[var(--r-card)] border px-5 py-4"
                style={{ borderColor: "var(--warn)", background: "var(--warn-dim)" }}
              >
                <p className="text-[0.8125rem] font-semibold" style={{ color: "var(--warn)" }}>
                  Final prep phase
                </p>
                <p className="mt-0.5 text-[0.8125rem]" style={{ color: "var(--warn)" }}>
                  Prioritise recovery and weight management in these final weeks.
                </p>
              </div>
            )}

            {/* Primary stat block — data is the visual */}
            <div>
              <p
                className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
                style={{ color: "var(--primary)" }}
              >
                Competition countdown
              </p>
              <div className="flex items-end gap-8">
                <div>
                  <p
                    className="font-bold tabular-nums leading-none"
                    style={{ fontSize: "clamp(3rem, 12vw, 4.5rem)", letterSpacing: "-0.04em", color: "var(--foreground)" }}
                  >
                    {daysToComp}
                  </p>
                  <p className="mt-1 text-[0.75rem] font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                    days to competition
                  </p>
                </div>
                {kgToComp !== null && kgToComp > 0 && (
                  <div>
                    <p
                      className="font-bold tabular-nums leading-none"
                      style={{ fontSize: "clamp(3rem, 12vw, 4.5rem)", letterSpacing: "-0.04em", color: "var(--primary)" }}
                    >
                      {kgToComp.toFixed(1)}
                    </p>
                    <p className="mt-1 text-[0.75rem] font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                      kg to cut
                      {compWeightClass ? ` to ${compWeightClass}kg` : ""}
                    </p>
                  </div>
                )}
                {kgToComp === 0 && (
                  <div>
                    <p
                      className="font-bold leading-none"
                      style={{ fontSize: "clamp(1.5rem, 5vw, 2rem)", letterSpacing: "-0.025em", color: "var(--success)" }}
                    >
                      At weight
                    </p>
                    <p className="mt-1 text-[0.75rem] font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                      {compWeightClass ? `${compWeightClass}kg class` : "target class"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Milestone progress — no card wrapper, just the bar and label */
          weeksLogged > 0 && estimate && (
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <p
                  className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: "var(--primary)" }}
                >
                  Progress milestone
                </p>
                <p className="text-[0.8125rem] font-semibold tabular-nums" style={{ color: "var(--foreground)" }}>
                  {milestonePct}%
                </p>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${milestonePct}%`, background: "var(--primary)" }}
                />
              </div>
              <p className="mt-2 text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>
                {weeksLogged} week{weeksLogged !== 1 ? "s" : ""} logged
                {weeksLogged >= 12 && (
                  <span style={{ color: "var(--success)" }}> · Exceptional commitment. 12 weeks in.</span>
                )}
                {weeksLogged >= 8 && weeksLogged < 12 && (
                  <span style={{ color: "var(--success)" }}> · 8 weeks logged.</span>
                )}
                {weeksLogged >= 4 && weeksLogged < 8 && (
                  <span style={{ color: "var(--success)" }}> · 4 weeks logged.</span>
                )}
              </p>
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
        <div className="space-y-2">
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

        {/* Empty state: no wizard data */}
        {!hasWizardData && (
          <div
            className="rounded-[var(--r-card)] border p-6"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <p className="text-[0.875rem] font-medium">Complete your profile</p>
            <p className="mt-1 text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>
              Complete the wizard to get your estimate and generate a training plan.
            </p>
            <Link href="/coach" className={cn(buttonVariants({ size: "sm" }), "mt-4 inline-flex")}>
              Start wizard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
