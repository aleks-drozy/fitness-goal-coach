"use client";

import { useWizard } from "@/context/WizardContext";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { StepHeader } from "@/components/wizard/StepHeader";
import { NavButtons } from "@/components/wizard/NavButtons";
import { ConsentGate } from "@/components/photos/ConsentGate";
import { PhotoUpload } from "@/components/photos/PhotoUpload";

export default function PhotosPage() {
  const { state, setPhotos } = useWizard();
  const { photos } = state;

  return (
    <>
      <ProgressBar currentStep={2} totalSteps={5} />
      <StepHeader
        title="Your photos (optional)"
        subtitle="Upload photos for visual context — your estimate works without them too."
        step={2}
        totalSteps={5}
      />
      <ConsentGate />
      <div
        className="space-y-6 overflow-hidden"
        style={{
          maxHeight: photos.consentGiven ? "1000px" : "0px",
          opacity: photos.consentGiven ? 1 : 0,
          transition: `max-height var(--dur-slow) var(--ease-out), opacity var(--dur-medium) var(--ease-out)`,
        }}
      >
        <PhotoUpload
          label="Current body photo"
          hint="A clear, well-lit photo helps us understand your starting point."
          base64Value={photos.currentPhotoBase64}
          onChange={(b64) => setPhotos({ currentPhotoBase64: b64 })}
        />
        {/* Goal physique photo hidden — feature-flagged for recovery if needed */}
        {/* <PhotoUpload label="Goal physique photo" ... /> */}
      </div>
      {/* Photos are optional — always allow proceeding */}
      <NavButtons
        backHref="/coach/onboarding"
        nextHref="/coach/questionnaire"
        disabled={false}
      />
    </>
  );
}
