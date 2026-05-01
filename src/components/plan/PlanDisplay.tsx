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
  periodization_notes?: string | null;
  sport?: string | null;
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

function sportDisplayName(sport?: string | null): string {
  if (!sport || sport === "none") return "Sport";
  const map: Record<string, string> = {
    judo: "Judo",
    bjj: "BJJ",
    wrestling: "Wrestling",
    mma: "MMA",
    boxing: "Boxing",
    running: "Running",
    cycling: "Cycling",
    football: "Football",
    other: "Sport",
  };
  return map[sport] ?? sport.charAt(0).toUpperCase() + sport.slice(1);
}

export function PlanDisplay({ plan }: PlanDisplayProps) {
  return (
    <div className="space-y-8">
      {/* Periodization overview — plain text above schedule, no card */}
      {plan.periodization_notes && (
        <div className="space-y-2">
          <SectionLabel>Programme overview</SectionLabel>
          <p className="text-[0.875rem] leading-relaxed" style={{ color: "var(--muted-foreground)", maxWidth: "56ch" }}>
            {plan.periodization_notes}
          </p>
        </div>
      )}

      {/* Weekly schedule — compact table, not stacked cards */}
      {(plan.weekly_schedule ?? []).length > 0 && (
        <div className="space-y-3">
          <SectionLabel>Weekly schedule</SectionLabel>
          <div
            className="rounded-[var(--r-card)] border overflow-hidden"
            style={{ borderColor: "var(--border)" }}
          >
            {(plan.weekly_schedule ?? []).map((session, i) => (
              <div
                key={i}
                className="px-5 py-4 space-y-2"
                style={{
                  borderTop: i > 0 ? `1px solid var(--border)` : undefined,
                  background: "var(--surface)",
                }}
              >
                <div className="flex items-baseline gap-3">
                  <span
                    className="shrink-0 text-[0.75rem] font-semibold uppercase tracking-wider tabular-nums"
                    style={{ color: "var(--primary)", minWidth: "2.5rem" }}
                  >
                    {session.day.slice(0, 3).toUpperCase()}
                  </span>
                  <span className="text-[0.8125rem] font-medium" style={{ color: "var(--foreground)" }}>
                    {session.focus}
                  </span>
                </div>
                {(session.exercises ?? []).length > 0 && (
                  <ul className="space-y-0.5 pl-[3.5rem]">
                    {(session.exercises ?? []).map((ex, j) => (
                      <li key={j} className="flex items-start gap-2 text-[0.8125rem]">
                        <span
                          className="shrink-0 tabular-nums text-[0.625rem] font-semibold mt-[0.2em]"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {String(j + 1).padStart(2, "0")}
                        </span>
                        <span style={{ color: "var(--muted-foreground)", lineHeight: "1.55" }}>{ex}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
            <div key={label} className="px-5 py-3 space-y-0.5">
              <p className="text-[0.75rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                {label}
              </p>
              <p className="text-[0.875rem]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sport-specific (conditional) */}
      {plan.judo_specific && (
        <div className="space-y-3">
          <SectionLabel>{sportDisplayName(plan.sport)} training</SectionLabel>
          <div
            className="rounded-[var(--r-card)] border divide-y"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div className="px-5 py-3 space-y-0.5">
              <p className="text-[0.75rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Technical focus
              </p>
              <p className="text-[0.875rem]">{plan.judo_specific?.technical_focus ?? "—"}</p>
            </div>
            <div className="px-5 py-3 space-y-0.5">
              <p className="text-[0.75rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
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
          <div className="px-5 py-3 space-y-0.5">
            <p className="text-[0.75rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              Sleep
            </p>
            <p className="text-[0.875rem]">{plan.recovery?.sleep ?? "—"}</p>
          </div>
          <div className="px-5 py-3 space-y-0.5">
            <p className="text-[0.75rem] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              Active recovery
            </p>
            <p className="text-[0.875rem]">{plan.recovery?.active_recovery ?? "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
