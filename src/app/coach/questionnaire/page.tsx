"use client";

import { useRouter } from "next/navigation";
import { useWizard } from "@/context/WizardContext";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { StepHeader } from "@/components/wizard/StepHeader";
import { NavButtons } from "@/components/wizard/NavButtons";
import { GoalForm } from "@/components/questionnaire/GoalForm";
import { SportSelector } from "@/components/questionnaire/SportSelector";

export default function QuestionnairePage() {
  const { state } = useWizard();
  const router = useRouter();
  const { questionnaire } = state;

  const isValid =
    questionnaire.goalType !== null &&
    questionnaire.workoutSetting !== null;

  const GRAPPLING_SPORTS = new Set(["judo", "bjj", "wrestling", "mma"]);
  const isGrappling = GRAPPLING_SPORTS.has(questionnaire.sport ?? "none");

  const handleNext = () => {
    if (isGrappling) {
      router.push("/coach/judo");
    } else {
      router.push("/coach/results");
    }
  };

  return (
    <>
      <ProgressBar currentStep={2} totalSteps={4} />
      <StepHeader
        title="Your goal and training"
        subtitle="A few more details help us tailor the estimate to your situation."
        step={2}
        totalSteps={4}
      />
      <GoalForm />
      <SportSelector />
      <NavButtons
        backHref="/coach/onboarding"
        onNext={handleNext}
        disabled={!isValid}
      />
    </>
  );
}
