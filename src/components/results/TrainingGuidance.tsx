interface TrainingGuidanceProps {
  guidance: string[];
}

export function TrainingGuidance({ guidance }: TrainingGuidanceProps) {
  return (
    <div
      className="rounded-[var(--r-card)] border p-5 space-y-3"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <p
        className="text-[0.8125rem] font-medium"
        style={{ color: "var(--foreground)" }}
      >
        Suggested training structure
      </p>
      <ul className="space-y-3">
        {guidance.map((point, i) => (
          <li key={i} className="flex gap-3 text-sm items-start">
            <span
              className="shrink-0 font-medium tabular-nums mt-px text-[0.75rem]"
              style={{ color: "var(--primary)" }}
            >
              {i + 1}.
            </span>
            <span style={{ color: "var(--muted-foreground)", lineHeight: "1.6" }}>
              {point}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
