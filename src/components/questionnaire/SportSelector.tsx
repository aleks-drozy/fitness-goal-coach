"use client";

import { useWizard } from "@/context/WizardContext";
import { Label } from "@/components/ui/label";

export function SportSelector() {
  const { state, setQuestionnaire } = useWizard();
  const { sport } = state.questionnaire;

  const options: { value: "none" | "judo"; label: string; description: string }[] = [
    { value: "none", label: "No sport", description: "Just gym or general fitness training" },
    { value: "judo", label: "Judo", description: "I train judo regularly alongside my fitness goals" },
  ];

  return (
    <div className="space-y-2">
      <Label>Do you also train a sport?</Label>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setQuestionnaire({ sport: opt.value })}
            className={`text-left rounded-xl border p-4 transition-colors ${
              sport === opt.value
                ? "border-white bg-zinc-800"
                : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
            }`}
          >
            <p className="text-sm font-medium">{opt.label}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{opt.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
