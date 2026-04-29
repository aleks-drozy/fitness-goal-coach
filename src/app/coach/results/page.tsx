"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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
import { ShareCard } from "@/components/results/ShareCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function ResultsPage() {
  const { state, setEstimateResult } = useWizard();
  const shouldReduceMotion = useReducedMotion();
  // Initialise from cached context — avoids re-fetching on every navigation to results
  const [result, setResult] = useState<EstimateResult | null>(state.estimateResult);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(state.estimateResult === null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // If we already have a cached result, skip the fetch and just resolve login state
    if (state.estimateResult !== null) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user));
      return;
    }

    fetchEstimate(state)
      .then(async (r) => {
        setResult(r);
        setEstimateResult(r); // persist to context + localStorage
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
        if (user) {
          // Best-effort save — failure doesn't affect displayed results
          supabase.from("profiles").upsert({
            id: user.id,
            wizard_state: {
              ...state,
              photos: { consentGiven: state.photos.consentGiven, currentPhotoBase64: null, goalPhotoBase64: null },
            },
            estimate_result: r,
          }).then(({ error }) => {
            if (error) console.error("Profile upsert failed:", error.message);
          });
        }
      })
      .catch(() => setError("Something went wrong generating your estimate. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const stagger = {
    hidden: {},
    show: {
      transition: shouldReduceMotion
        ? {}
        : { staggerChildren: 0.055, delayChildren: 0.08 },
    },
  };

  const fadeUp = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, duration: 0.42, bounce: 0 },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="min-h-[70vh] flex flex-col items-center justify-center gap-4"
          style={{ color: "var(--muted-foreground)" }}
        >
          <div
            className="size-7 rounded-full border-2 animate-spin"
            style={{
              borderColor: "var(--border)",
              borderTopColor: "var(--primary)",
            }}
          />
          <p className="text-sm">Generating your estimate…</p>
        </motion.div>
      )}

      {!loading && (error || !result) && (
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-[70vh] flex flex-col items-center justify-center gap-4"
        >
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {error ?? "No result returned."}
          </p>
          <Button variant="ghost" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </motion.div>
      )}

      {!loading && result && (
        <motion.div
          key="results"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp}>
            <ProgressBar currentStep={5} totalSteps={5} />
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8">
            <StepHeader
              title={`${state.onboarding.name ? state.onboarding.name + "'s" : "Your"} estimate`}
              subtitle="Based on what you've told us. This is a realistic range, not a guarantee."
              step={5}
              totalSteps={5}
            />
          </motion.div>

          <div className="space-y-4 mt-6">
            <motion.div variants={fadeUp}>
              <EstimateCard result={result} />
            </motion.div>
            <motion.div variants={fadeUp}>
              <ReasoningBlock reasoning={result.reasoning} />
            </motion.div>
            <motion.div variants={fadeUp}>
              <TrainingGuidance guidance={result.trainingGuidance} />
            </motion.div>
            <motion.div variants={fadeUp}>
              <NutritionNote note={result.nutritionNote} />
            </motion.div>
            <motion.div variants={fadeUp}>
              <Disclaimer />
            </motion.div>
            {result && (
              <motion.div variants={fadeUp} className="flex justify-center">
                <ShareCard result={result} state={state} />
              </motion.div>
            )}
            <motion.div variants={fadeUp} className="pt-2">
              <Link
                href="/coach/upsell"
                className={cn(buttonVariants({ size: "lg" }), "w-full")}
              >
                See what's included in Premium →
              </Link>
            </motion.div>

            {isLoggedIn === false && (
              <motion.div variants={fadeUp}>
                <div
                  className="rounded-[var(--r-card)] border p-5 text-center"
                  style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                >
                  <p className="text-[0.875rem] font-medium">Save your results</p>
                  <p className="mt-1 text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>
                    Create a free account to track weekly progress and generate a full training plan.
                  </p>
                  <Link
                    href="/signup"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
                  >
                    Create free account
                  </Link>
                </div>
              </motion.div>
            )}

            {isLoggedIn === true && (
              <motion.div variants={fadeUp}>
                <div
                  className="rounded-[var(--r-card)] border p-5"
                  style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                >
                  <p className="text-[0.8125rem] font-medium" style={{ color: "var(--success)" }}>
                    Results saved to your account
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Link href="/dashboard" className={cn(buttonVariants({ size: "sm" }), "flex-1")}>
                      Go to dashboard
                    </Link>
                    <Link href="/plan" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}>
                      Generate plan
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
