"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlanDisplay } from "@/components/plan/PlanDisplay";

interface FitnessPlan {
  weekly_schedule: Array<{ day: string; focus: string; exercises: string[] }>;
  nutrition: { calories_guidance: string; protein_target: string; meal_timing: string };
  judo_specific: { technical_focus: string; conditioning_priority: string } | null;
  recovery: { sleep: string; active_recovery: string };
}

interface PlanClientProps {
  initialPlan: FitnessPlan | null;
  hasProfile: boolean;
}

export function PlanClient({ initialPlan, hasProfile }: PlanClientProps) {
  const [plan, setPlan] = useState<FitnessPlan | null>(initialPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generatePlan() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/plan", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }
    setPlan(data.plan);
  }

  if (!hasProfile) {
    return (
      <div
        className="rounded-[var(--r-card)] border p-8 text-center"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <p className="text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
          Complete the fitness wizard first to generate a personalized plan.
        </p>
        <a
          href="/coach"
          className="mt-4 inline-block text-[0.875rem] font-medium"
          style={{ color: "var(--primary)" }}
        >
          Start wizard →
        </a>
      </div>
    );
  }

  if (!plan) {
    return (
      <div
        className="rounded-[var(--r-card)] border p-8 text-center space-y-4"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div>
          <p className="text-[0.875rem] font-medium">No plan yet</p>
          <p className="mt-1 text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>
            Generate a personalized weekly schedule, nutrition strategy, and recovery plan based on your wizard results.
          </p>
        </div>
        {error && (
          <p className="text-[0.8125rem]" style={{ color: "var(--destructive)" }}>
            {error}
          </p>
        )}
        <Button size="lg" onClick={generatePlan} disabled={loading} className="w-full">
          {loading ? "Generating…" : "Generate my plan"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PlanDisplay plan={plan} />
      <div className="pt-2">
        {error && (
          <p className="mb-3 text-[0.8125rem]" style={{ color: "var(--destructive)" }}>
            {error}
          </p>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={generatePlan}
          disabled={loading}
        >
          {loading ? "Regenerating…" : "Regenerate plan"}
        </Button>
      </div>
    </div>
  );
}
