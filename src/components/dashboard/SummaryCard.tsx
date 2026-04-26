interface EstimateResult {
  timeframeMin: number;
  timeframeMax: number;
  timeframeUnit: string;
  confidenceLevel: "low" | "medium" | "high";
}

interface LatestEntry {
  on_track: boolean | null;
  ai_feedback: string | null;
}

interface SummaryCardProps {
  estimate: EstimateResult | null;
  latestEntry: LatestEntry | null;
}

export function SummaryCard({ estimate, latestEntry }: SummaryCardProps) {
  const onTrack = latestEntry?.on_track;

  return (
    <div
      className="rounded-[var(--r-card)] border p-6 space-y-4"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <p
        className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
        style={{ color: "var(--primary)" }}
      >
        Estimate
      </p>

      {estimate ? (
        <div className="flex items-end gap-1.5">
          <span className="text-4xl font-bold tracking-[-0.03em]" style={{ letterSpacing: "-0.04em" }}>
            {estimate.timeframeMin}–{estimate.timeframeMax}
          </span>
          <span className="mb-1 text-lg" style={{ color: "var(--muted-foreground)" }}>
            {estimate.timeframeUnit}
          </span>
        </div>
      ) : (
        <p className="text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
          Complete the wizard to see your estimate.
        </p>
      )}

      {latestEntry && onTrack !== null && (
        <div className="flex items-center gap-2">
          <div
            className="size-2 rounded-full"
            style={{ background: onTrack ? "var(--success)" : "var(--warn)" }}
          />
          <span className="text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>
            {onTrack ? "Currently on track" : "Trajectory needs adjustment"}
          </span>
        </div>
      )}

      {!latestEntry && estimate && (
        <p className="text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>
          Start logging weekly check-ins to track your trajectory.
        </p>
      )}
    </div>
  );
}
