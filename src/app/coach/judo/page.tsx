"use client";

import { useWizard } from "@/context/WizardContext";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { StepHeader } from "@/components/wizard/StepHeader";
import { NavButtons } from "@/components/wizard/NavButtons";
import { JudoForm } from "@/components/judo/JudoForm";

export default function JudoPage() {
  const { state } = useWizard();
  const { judo, competitionContext } = state;

  const competitionValid = competitionContext.isActivelyCompeting
    ? competitionContext.weightClass !== null && !!competitionContext.competitionDate
    : true;

  const isValid =
    judo.sessionsPerWeek !== null &&
    judo.intensity !== null &&
    competitionValid;

  return (
    <>
      <ProgressBar currentStep={3} totalSteps={4} />
      <StepHeader
        title="Grappling training details"
        subtitle="We'll factor your mat load into the S&C recommendations so the plan supports — not fights — your training."
        step={3}
        totalSteps={4}
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
