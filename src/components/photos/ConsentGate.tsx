"use client";

import { useWizard } from "@/context/WizardContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function ConsentGate() {
  const { state, setPhotos } = useWizard();

  return (
    <div
      className="rounded-[var(--r-card)] border p-5 space-y-4"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <p className="text-[0.8125rem] font-medium" style={{ color: "var(--foreground)" }}>
        Before you upload
      </p>
      <ul className="space-y-2">
        {[
          "Photos are used only to analyse your starting point and goal.",
          "They are not stored on our servers after analysis.",
          "Goal photos may depict different genetics, lighting, or editing — we will note this.",
          "Image analysis may be imperfect and is not a medical assessment.",
        ].map((item) => (
          <li key={item} className="flex gap-2.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
            <span className="shrink-0 mt-0.5" style={{ color: "var(--primary)" }}>·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div
        className="flex items-start gap-3 pt-1 mt-1 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <Checkbox
          id="consent"
          checked={state.photos.consentGiven}
          onCheckedChange={(v) => setPhotos({ consentGiven: Boolean(v) })}
          className="mt-0.5"
        />
        <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer font-normal">
          I understand and consent to my photos being processed for this estimate.
        </Label>
      </div>
    </div>
  );
}
