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

  const handleNext = () => {
    if (questionnaire.sport === "judo") {
      router.push("/coach/judo");
    } else {
      router.push("/coach/results");
    }
  };

  return (
    <>
      <ProgressBar currentStep={3} totalSteps={5} />
      <StepHeader
        title="Your goal and training"
        subtitle="A few more details help us tailor the estimate to your situation."
      />
      <GoalForm />
      <SportSelector />
      <NavButtons
        backHref="/coach/photos"
        onNext={handleNext}
        disabled={!isValid}
      />
    </>
  );
}
