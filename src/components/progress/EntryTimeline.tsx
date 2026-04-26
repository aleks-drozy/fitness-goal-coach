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
      <h2 className="text-base font-semibold tracking-tight">Progress history</h2>

      <div className="space-y-3">
        {sorted.map((entry) => (
          <div
            key={entry.id}
            className="rounded-[var(--r-card)] border p-5 space-y-3"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {entry.on_track !== null && (
                  <div
                    className="size-2 rounded-full"
                    style={{ background: entry.on_track ? "var(--success)" : "var(--warn)" }}
                  />
                )}
                <span className="text-[0.8125rem] font-medium">Week {entry.week_number}</span>
              </div>
              <span className="text-[0.8125rem] font-semibold" style={{ color: "var(--primary)" }}>
                {entry.current_weight}kg
              </span>
            </div>

            {entry.notes && (
              <p className="text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>
                {entry.notes}
              </p>
            )}

            {entry.ai_feedback && (
              <div
                className="rounded-[var(--r-input)] border-l-2 pl-3 py-1"
                style={{ borderColor: "var(--primary)", color: "var(--foreground)" }}
              >
                <p className="text-[0.8125rem] leading-relaxed">{entry.ai_feedback}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
