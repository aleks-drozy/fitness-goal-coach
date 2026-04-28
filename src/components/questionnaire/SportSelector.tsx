"use client";

import { useWizard } from "@/context/WizardContext";
import { Label } from "@/components/ui/label";
import { Sport } from "@/lib/types";

const SPORT_OPTIONS: { value: Sport; label: string; description: string }[] = [
  { value: "none", label: "No sport", description: "Gym or general fitness" },
  { value: "judo", label: "Judo", description: "Mat sessions + S&C" },
  { value: "bjj", label: "BJJ", description: "Rolling + strength work" },
  { value: "wrestling", label: "Wrestling", description: "Mat + conditioning" },
  { value: "boxing", label: "Boxing / Kickboxing", description: "Striking + cardio" },
  { value: "mma", label: "MMA", description: "Mixed training load" },
  { value: "running", label: "Running", description: "Road or trail" },
  { value: "cycling", label: "Cycling", description: "Road or MTB" },
  { value: "football", label: "Football / Soccer", description: "Team sport" },
  { value: "other", label: "Other sport", description: "I play another sport" },
];

export function SportSelector() {
  const { state, setQuestionnaire } = useWizard();
  const { sport } = state.questionnaire;

  return (
    <div className="space-y-2">
      <Label>Do you also train a sport?</Label>
      <div className="grid grid-cols-2 gap-2">
        {SPORT_OPTIONS.map((opt) => {
          const isSelected = sport === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setQuestionnaire({ sport: opt.value })}
              className="text-left rounded-[var(--r-card)] border p-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
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
                className="text-xs mt-0.5 leading-relaxed"
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
