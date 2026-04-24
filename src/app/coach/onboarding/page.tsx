"use client";

import { useWizard } from "@/context/WizardContext";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { StepHeader } from "@/components/wizard/StepHeader";
import { NavButtons } from "@/components/wizard/NavButtons";
import { PersonalInfoForm } from "@/components/onboarding/PersonalInfoForm";

export default function OnboardingPage() {
  const { state } = useWizard();
  const { onboarding } = state;

  const isValid =
    onboarding.name.trim().length > 0 &&
    onboarding.age !== null &&
    onboarding.sex !== null &&
    onboarding.heightCm !== null &&
    onboarding.weightKg !== null &&
    onboarding.experience !== null &&
    onboarding.activityLevel !== null;

  return (
    <>
      <ProgressBar currentStep={1} totalSteps={5} />
      <StepHeader
        title="Tell us about yourself"
        subtitle="This helps us give you a more accurate estimate. All information stays on your device."
      />
      <PersonalInfoForm />
      <NavButtons
        nextHref="/coach/photos"
        disabled={!isValid}
        nextLabel="Continue"
      />
    </>
  );
}
