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
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

function CompetitionHero({
  weightClass,
  competitionDate,
  currentWeight,
}: {
  weightClass: number | string | null;
  competitionDate: string | null;
  currentWeight: number | null;
}) {
  const daysLeft = competitionDate
    ? Math.round((new Date(competitionDate).getTime() - Date.now()) / 86_400_000)
    : null;

  const kgToDrop =
    currentWeight && weightClass && typeof weightClass === "number"
      ? Math.max(0, currentWeight - weightClass)
      : null;

  const weeksLeft = daysLeft !== null ? Math.round(daysLeft / 7) : null;
  const isWithin12Weeks = weeksLeft !== null && weeksLeft <= 12;

  const weightCutParams = new URLSearchParams();
  if (currentWeight) weightCutParams.set("cw", String(currentWeight));
  if (weightClass) weightCutParams.set("tc", String(weightClass));
  if (competitionDate) weightCutParams.set("date", competitionDate);

  return (
    <div
      className="rounded-[var(--r-card)] border p-5 space-y-3"
      style={{ borderColor: "var(--primary)", background: "var(--accent-dim)" }}
    >
      <p
        className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
        style={{ color: "var(--primary)" }}
      >
        Competition prep
      </p>
      <h2 className="text-xl font-semibold tracking-tight">
        Here&apos;s your path to{" "}
        <span style={{ color: "var(--primary)" }}>
          {weightClass}kg
        </span>
      </h2>
      {daysLeft !== null && kgToDrop !== null && (
        <p className="text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
          {daysLeft} days until competition.{" "}
          {kgToDrop > 0
            ? `You need to drop ${kgToDrop.toFixed(1)}kg.`
            : "You&apos;re already at weight."}
        </p>
      )}
      {daysLeft !== null && kgToDrop === null && (
        <p className="text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
          {daysLeft} days until competition.
        </p>
      )}
      {isWithin12Weeks && (
        <Link
          href={`/weight-cut?${weightCutParams.toString()}`}
          className={cn(buttonVariants({ size: "sm" }), "mt-2 inline-flex")}
        >
          Build Your Weight Cut Plan →
        </Link>
      )}
    </div>
  );
}

export default function ResultsPage() {
  const { state, hydrated, setEstimateResult } = useWizard();
  const shouldReduceMotion = useReducedMotion();
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const { competitionContext, onboarding } = state;
  const isCompeting = competitionContext.isActivelyCompeting;

  useEffect(() => {
    if (!hydrated) return;

    if (state.estimateResult !== null) {
      setResult(state.estimateResult);
      setLoading(false);
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        setIsLoggedIn(!!user);
        // Upsert even when estimate is cached — handles the case where the user
        // completed the wizard as a guest, created an account, and was redirected
        // back here. Without this, wizard_state is never saved to Supabase.
        if (user) {
          supabase.from("profiles").upsert({
            id: user.id,
            wizard_state: state,
            estimate_result: state.estimateResult,
          }).then(({ error }) => {
            if (error) console.error("Profile upsert failed:", error.message);
          });
        }
      });
      return;
    }

    fetchEstimate(state)
      .then(async (r) => {
        setResult(r);
        setEstimateResult(r);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
        if (user) {
          supabase.from("profiles").upsert({
            id: user.id,
            wizard_state: state,
            estimate_result: r,
          }).then(({ error }) => {
            if (error) console.error("Profile upsert failed:", error.message);
          });
        }
      })
      .catch(() => setError("Something went wrong generating your estimate. Please try again."))
      .finally(() => setLoading(false));
  }, [hydrated]);

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
            style={{ borderColor: "var(--border)", borderTopColor: "var(--primary)" }}
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
        <motion.div key="results" variants={stagger} initial="hidden" animate="show">
          <motion.div variants={fadeUp}>
            <ProgressBar currentStep={4} totalSteps={4} />
          </motion.div>

          {!isCompeting && (
            <motion.div variants={fadeUp} className="mt-8">
              <StepHeader
                title={`${onboarding.name ? onboarding.name + "'s" : "Your"} estimate`}
                subtitle="Based on what you've told us. This is a realistic range, not a guarantee."
                step={5}
                totalSteps={4}
              />
            </motion.div>
          )}

          <div className="space-y-4 mt-6">
            {/* Competition hero — shown first when actively competing */}
            {isCompeting && (
              <motion.div variants={fadeUp}>
                <CompetitionHero
                  weightClass={competitionContext.weightClass}
                  competitionDate={competitionContext.competitionDate}
                  currentWeight={onboarding.weightKg}
                />
              </motion.div>
            )}

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

            <motion.div variants={fadeUp} className="pt-2">
              <Link
                href="/coach/upsell"
                className={cn(buttonVariants({ size: "lg" }), "w-full")}
              >
                See what&apos;s included in Premium →
              </Link>
            </motion.div>

            {isLoggedIn === false && (
              <motion.div variants={fadeUp}>
                <div
                  className="rounded-[var(--r-card)] border p-5"
                  style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                >
                  <p className="text-[0.875rem] font-medium">Save your results</p>
                  <p className="mt-1 text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>
                    Create a free account to track weekly progress and generate a full training plan.
                  </p>
                  <Link
                    href="/signup"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 inline-flex")}
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
