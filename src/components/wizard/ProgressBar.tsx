interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div
      className="flex items-center gap-0 w-full"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Step ${currentStep} of ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div
              className="shrink-0 size-[7px] rounded-full"
              style={{
                background:
                  isCompleted || isActive
                    ? "var(--primary)"
                    : "var(--border)",
                boxShadow:
                  isActive
                    ? "0 0 0 3px oklch(0.72 0.19 58 / 20%)"
                    : "none",
                transform: isActive ? "scale(1.3)" : "scale(1)",
                transition: `
                  background var(--dur-medium) var(--ease-out),
                  box-shadow var(--dur-medium) var(--ease-out),
                  transform var(--dur-medium) var(--ease-out)
                `,
              }}
            />
            {step < totalSteps && (
              <div
                className="flex-1 mx-1.5 overflow-hidden rounded-full"
                style={{ height: "1.5px", background: "var(--border)" }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "var(--primary)",
                    width: isCompleted ? "100%" : "0%",
                    transition: `width var(--dur-medium) var(--ease-out)`,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
