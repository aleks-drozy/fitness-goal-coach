interface WeekDay {
  day: string;
  focus: string;
  exercises: string[];
}

interface FitnessPlan {
  weekly_schedule?: WeekDay[];
  nutrition?: {
    calories_guidance?: string;
    protein_target?: string;
    meal_timing?: string;
  } | null;
  judo_specific?: {
    technical_focus?: string;
    conditioning_priority?: string;
  } | null;
  recovery?: {
    sleep?: string;
    active_recovery?: string;
  } | null;
}

interface PlanDisplayProps {
  plan: FitnessPlan;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
      style={{ color: "var(--primary)" }}
    >
      {children}
    </p>
  );
}

export function PlanDisplay({ plan }: PlanDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Weekly schedule */}
      <div className="space-y-3">
        <SectionLabel>Weekly schedule</SectionLabel>
        <div className="space-y-2">
          {(plan.weekly_schedule ?? []).map((session, i) => (
            <div
              key={i}
              className="rounded-[var(--r-card)] border p-4 space-y-2"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <div className="flex items-baseline gap-3">
                <span className="text-[0.875rem] font-semibold">{session.day}</span>
                <span className="text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>
                  {session.focus}
                </span>
              </div>
              <ul className="space-y-1">
                {(session.exercises ?? []).map((ex, j) => (
                  <li key={j} className="flex items-start gap-2 text-[0.8125rem]">
                    <span
                      className="mt-[0.2em] shrink-0 text-[0.625rem] font-semibold tabular-nums"
                      style={{ color: "var(--primary)" }}
                    >
                      {String(j + 1).padStart(2, "0")}
                    </span>
                    <span style={{ color: "var(--muted-foreground)" }}>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Nutrition */}
      <div className="space-y-3">
        <SectionLabel>Nutrition</SectionLabel>
        <div
          className="rounded-[var(--r-card)] border divide-y"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          {[
            { label: "Calories", value: plan.nutrition?.calories_guidance ?? "—" },
            { label: "Protein", value: plan.nutrition?.protein_target ?? "—" },
            { label: "Meal timing", value: plan.nutrition?.meal_timing ?? "—" },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 py-3 space-y-0.5">
              <p className="text-[0.75rem] font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                {label}
              </p>
              <p className="text-[0.875rem]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Judo-specific (conditional) */}
      {plan.judo_specific && (
        <div className="space-y-3">
          <SectionLabel>Judo training</SectionLabel>
          <div
            className="rounded-[var(--r-card)] border divide-y"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div className="px-4 py-3 space-y-0.5">
              <p className="text-[0.75rem] font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Technical focus
              </p>
              <p className="text-[0.875rem]">{plan.judo_specific?.technical_focus ?? "—"}</p>
            </div>
            <div className="px-4 py-3 space-y-0.5">
              <p className="text-[0.75rem] font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Conditioning priority
              </p>
              <p className="text-[0.875rem]">{plan.judo_specific?.conditioning_priority ?? "—"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recovery */}
      <div className="space-y-3">
        <SectionLabel>Recovery</SectionLabel>
        <div
          className="rounded-[var(--r-card)] border divide-y"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="px-4 py-3 space-y-0.5">
            <p className="text-[0.75rem] font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              Sleep
            </p>
            <p className="text-[0.875rem]">{plan.recovery?.sleep ?? "—"}</p>
          </div>
          <div className="px-4 py-3 space-y-0.5">
            <p className="text-[0.75rem] font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              Active recovery
            </p>
            <p className="text-[0.875rem]">{plan.recovery?.active_recovery ?? "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
