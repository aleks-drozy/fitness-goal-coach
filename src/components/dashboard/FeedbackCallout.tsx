interface FeedbackCalloutProps {
  weekNumber: number;
  feedback: string;
  onTrack: boolean | null;
}

export function FeedbackCallout({ weekNumber, feedback, onTrack }: FeedbackCalloutProps) {
  return (
    <div
      className="rounded-[var(--r-card)] border p-5 space-y-3"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="flex items-center justify-between">
        <p
          className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
          style={{ color: "var(--primary)" }}
        >
          Coach feedback: Week {weekNumber}
        </p>
        {onTrack !== null && (
          <div className="flex items-center gap-1.5">
            <div
              className="size-1.5 rounded-full"
              style={{ background: onTrack ? "var(--success)" : "var(--warn)" }}
            />
            <span
              className="text-[0.75rem] font-medium"
              style={{ color: onTrack ? "var(--success)" : "var(--warn)" }}
            >
              {onTrack ? "On track" : "Off track"}
            </span>
          </div>
        )}
      </div>
      <p className="text-[0.875rem] leading-relaxed">{feedback}</p>
    </div>
  );
}
