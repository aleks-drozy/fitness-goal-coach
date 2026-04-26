"use client";

import { useWizard } from "@/context/WizardContext";
import { Label } from "@/components/ui/label";

export function SportSelector() {
  const { state, setQuestionnaire } = useWizard();
  const { sport } = state.questionnaire;

  const options: { value: "none" | "judo"; label: string; description: string }[] = [
    { value: "none", label: "No sport", description: "Gym or general fitness only" },
    { value: "judo", label: "Judo", description: "I train judo alongside fitness goals" },
  ];

  return (
    <div className="space-y-2">
      <Label>Do you also train a sport?</Label>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = sport === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setQuestionnaire({ sport: opt.value })}
              className="text-left rounded-[var(--r-card)] border p-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
              style={{
                background: isSelected ? "var(--accent-dim)" : "var(--surface)",
                borderColor: isSelected ? "var(--primary)" : "var(--border)",
                transition: `border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)`,
              }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: isSelected ? "var(--primary)" : "var(--foreground)" }}
              >
                {opt.label}
              </p>
              <p
                className="text-xs mt-1 leading-relaxed"
                style={{ color: "var(--muted-foreground)" }}
              >
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
