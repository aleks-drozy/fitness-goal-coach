import { Button } from "@/components/ui/button";

const features = [
  "Detailed weekly training plan tailored to your goal",
  "Nutrition guidance with calorie and protein targets",
  "Weekly AI check-ins with updated timeline",
  "Recovery and sleep recommendations",
  "Injury-aware exercise modifications",
  "Judo S&C integration — strength work around your mat sessions",
  "Plan adjustments as your progress changes",
];

export function PremiumCard() {
  return (
    <div
      className="rounded-[var(--r-card)] border overflow-hidden"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="px-6 py-6 space-y-1" style={{ background: "var(--accent-dim)" }}>
        <p
          className="text-[0.6875rem] font-medium tracking-[0.08em] uppercase"
          style={{ color: "var(--primary)" }}
        >
          Premium Coaching
        </p>
        <p
          className="text-xl font-semibold leading-snug"
          style={{ color: "var(--foreground)", letterSpacing: "-0.015em" }}
        >
          Everything you need to actually get there
        </p>
      </div>

      <ul className="px-6 py-5 space-y-3.5 border-t" style={{ borderColor: "var(--border)" }}>
        {features.map((f) => (
          <li key={f} className="flex gap-3 text-sm items-start">
            <span
              className="shrink-0 mt-px font-bold text-base leading-none"
              style={{ color: "var(--success)" }}
            >
              ✓
            </span>
            <span style={{ color: "var(--muted-foreground)", lineHeight: "1.55" }}>{f}</span>
          </li>
        ))}
      </ul>

      <div className="px-6 pb-6 pt-1 space-y-3">
        <Button
          className="w-full"
          size="lg"
          disabled
        >
          Coming soon — join the waitlist
        </Button>
        <p
          className="text-xs text-center"
          style={{ color: "var(--muted-foreground)", opacity: 0.7 }}
        >
          Premium is not yet available. You will be notified when it launches.
        </p>
      </div>
    </div>
  );
}
