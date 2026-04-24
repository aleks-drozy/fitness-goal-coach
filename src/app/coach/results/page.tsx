"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWizard } from "@/context/WizardContext";
import { fetchEstimate } from "@/lib/estimate";
import { EstimateResult } from "@/lib/types";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { StepHeader } from "@/components/wizard/StepHeader";
import { EstimateCard } from "@/components/results/EstimateCard";
import { ReasoningBlock } from "@/components/results/ReasoningBlock";
import { TrainingGuidance } from "@/components/results/TrainingGuidance";
import { NutritionNote } from "@/components/results/NutritionNote";
import { Disclaimer } from "@/components/results/Disclaimer";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ResultsPage() {
  const { state } = useWizard();
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstimate(state)
      .then(setResult)
      .catch(() => setError("Something went wrong generating your estimate. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-zinc-400">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
        <p className="text-sm">Generating your estimate…</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400 text-sm">{error}</p>
        <Button variant="ghost" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <>
      <ProgressBar currentStep={5} totalSteps={5} />
      <StepHeader
        title={`${state.onboarding.name ? state.onboarding.name + "'s" : "Your"} estimate`}
        subtitle="Based on what you've told us. This is a realistic range, not a guarantee."
      />
      <div className="space-y-6">
        <EstimateCard result={result} />
        <ReasoningBlock reasoning={result.reasoning} />
        <TrainingGuidance guidance={result.trainingGuidance} />
        <NutritionNote note={result.nutritionNote} />
        <Disclaimer />
        <div className="pt-2">
          <Link
            href="/coach/upsell"
            className={cn(buttonVariants({ size: "lg" }), "w-full bg-white text-zinc-950 hover:bg-zinc-100 font-medium")}
          >
            See what's included in Premium →
          </Link>
        </div>
      </div>
    </>
  );
}
