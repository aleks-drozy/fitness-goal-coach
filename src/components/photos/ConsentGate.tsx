"use client";

import { useWizard } from "@/context/WizardContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function ConsentGate() {
  const { state, setPhotos } = useWizard();
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
      <p className="text-sm font-medium text-zinc-200">Before you upload</p>
      <ul className="text-sm text-zinc-400 space-y-1.5 list-disc list-inside">
        <li>Photos are used only to analyse your starting point and goal.</li>
        <li>They are not stored on our servers after analysis.</li>
        <li>Goal photos may depict different genetics, lighting, or editing — we will note this.</li>
        <li>Image analysis may be imperfect and is not a medical assessment.</li>
      </ul>
      <div className="flex items-start gap-3 pt-1">
        <Checkbox
          id="consent"
          checked={state.photos.consentGiven}
          onCheckedChange={(v) => setPhotos({ consentGiven: Boolean(v) })}
        />
        <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
          I understand and consent to my photos being processed for this estimate.
        </Label>
      </div>
    </div>
  );
}
