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

  const isValid =
    photos.consentGiven &&
    photos.currentPhotoBase64 !== null &&
    photos.goalPhotoBase64 !== null;

  return (
    <>
      <ProgressBar currentStep={2} totalSteps={5} />
      <StepHeader
        title="Your photos"
        subtitle="Upload a current photo and a goal physique photo. Read the notice below first."
      />
      <ConsentGate />
      {photos.consentGiven && (
        <div className="space-y-6">
          <PhotoUpload
            label="Current body photo"
            hint="A clear, well-lit photo helps us understand your starting point."
            base64Value={photos.currentPhotoBase64}
            onChange={(b64) => setPhotos({ currentPhotoBase64: b64 })}
          />
          <PhotoUpload
            label="Goal physique photo"
            hint="This may depict a different person's genetics, lighting, or editing. We will account for this."
            base64Value={photos.goalPhotoBase64}
            onChange={(b64) => setPhotos({ goalPhotoBase64: b64 })}
          />
        </div>
      )}
      <NavButtons
        backHref="/coach/onboarding"
        nextHref="/coach/questionnaire"
        disabled={!isValid}
      />
    </>
  );
}
