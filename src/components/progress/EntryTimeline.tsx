interface ProgressEntry {
  id: string;
  week_number: number;
  current_weight: number;
  notes: string | null;
  ai_feedback: string | null;
  on_track: boolean | null;
  created_at: string;
}

interface EntryTimelineProps {
  entries: ProgressEntry[];
}

export function EntryTimeline({ entries }: EntryTimelineProps) {
  const sorted = [...entries].sort((a, b) => b.week_number - a.week_number);

  return (
    <div className="space-y-3">
      <h2
        className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
        style={{ color: "var(--primary)" }}
      >
        Progress history
      </h2>

      <div
        className="rounded-[var(--r-card)] border overflow-hidden divide-y"
        style={{ borderColor: "var(--border)" }}
      >
        {sorted.map((entry) => (
          <div
            key={entry.id}
            className="px-5 py-4 space-y-2"
            style={{ background: "var(--surface)" }}
          >
            {/* Row header: week + status + weight */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {entry.on_track !== null && (
                  <div
                    className="size-1.5 rounded-full shrink-0"
                    style={{ background: entry.on_track ? "var(--success)" : "var(--warn)" }}
                  />
                )}
                <span className="text-[0.8125rem] font-medium">
                  Week {entry.week_number}
                </span>
                {entry.on_track !== null && (
                  <span
                    className="text-[0.75rem]"
                    style={{ color: entry.on_track ? "var(--success)" : "var(--warn)" }}
                  >
                    {entry.on_track ? "on track" : "off track"}
                  </span>
                )}
              </div>
              <span className="text-[0.875rem] font-semibold tabular-nums shrink-0" style={{ color: "var(--primary)" }}>
                {entry.current_weight}kg
              </span>
            </div>

            {/* Notes */}
            {entry.notes && (
              <p className="text-[0.8125rem] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                {entry.notes}
              </p>
            )}

            {/* AI feedback — background tint, no side stripe */}
            {entry.ai_feedback && (
              <div
                className="rounded-[var(--r-input)] px-3 py-2.5"
                style={{ background: "var(--surface-raised)" }}
              >
                <p className="text-[0.8125rem] leading-relaxed" style={{ color: "var(--foreground)" }}>
                  {entry.ai_feedback}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
