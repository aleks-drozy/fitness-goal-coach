"use client";

import { useWizard } from "@/context/WizardContext";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { StepHeader } from "@/components/wizard/StepHeader";
import { NavButtons } from "@/components/wizard/NavButtons";
import { JudoForm } from "@/components/judo/JudoForm";

export default function JudoPage() {
  const { state } = useWizard();
  const { judo } = state;

  const isValid =
    judo.sessionsPerWeek !== null &&
    judo.intensity !== null;

  return (
    <>
      <ProgressBar currentStep={4} totalSteps={5} />
      <StepHeader
        title="Judo training details"
        subtitle="We'll factor your judo load into the S&C recommendations so the plan supports — not fights — your mat time."
        step={4}
        totalSteps={5}
      />
      <JudoForm />
      <NavButtons
        backHref="/coach/questionnaire"
        nextHref="/coach/results"
        disabled={!isValid}
        nextLabel="Get my estimate"
      />
    </>
  );
}
