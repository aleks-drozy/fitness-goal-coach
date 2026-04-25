interface StepHeaderProps {
  title: string;
  subtitle?: string;
  step?: number;
  totalSteps?: number;
}

export function StepHeader({ title, subtitle, step, totalSteps }: StepHeaderProps) {
  return (
    <div className="space-y-2">
      {step && totalSteps && (
        <p
          className="text-[0.6875rem] font-medium tracking-[0.08em] uppercase"
          style={{ color: "var(--muted-foreground)" }}
        >
          Step {step} of {totalSteps}
        </p>
      )}
      <h2
        className="font-semibold leading-tight"
        style={{ fontSize: "1.75rem", letterSpacing: "-0.02em", color: "var(--foreground)" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--muted-foreground)" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
