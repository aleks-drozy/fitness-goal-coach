"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { EstimateResult, WizardState } from "@/lib/types";

interface ShareCardProps {
  result: EstimateResult;
  state: WizardState;
}

export function ShareCard({ result, state }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    setGenerating(true);
    const html2canvas = (await import("html2canvas")).default;
    if (!cardRef.current) { setGenerating(false); return; }

    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: "#0f111a",
      scale: 2,
      useCORS: true,
      logging: false,
      onclone: (clonedDoc) => {
        // html2canvas parses computed colors from ancestor elements (body, html)
        // which use oklch() — a color function html2canvas doesn't support.
        // The capture target is 100% inline-styled, so stripping all stylesheets
        // from the clone leaves only safe hex inline styles.
        clonedDoc
          .querySelectorAll('style, link[rel="stylesheet"]')
          .forEach((n) => n.remove());
        clonedDoc.body.style.cssText = "margin:0;padding:0;background:#0f111a";
      },
    });

    const link = document.createElement("a");
    link.download = "my-fitness-estimate.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    setGenerating(false);
  }

  const goalLabels: Record<string, string> = {
    fat_loss: "Fat loss",
    muscle_gain: "Muscle gain",
    recomposition: "Recomposition",
  };

  return (
    <div>
      {/* Off-screen render card — html2canvas captures this */}
      <div
        ref={cardRef}
        className="pointer-events-none fixed -left-[9999px] top-0"
        style={{ width: 600, padding: 48, background: "#0f111a", fontFamily: "system-ui, sans-serif" }}
      >
        {/* Amber glow top strip */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #d97706, #f59e0b)", borderRadius: 2, marginBottom: 40 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#111", fontSize: 16, fontWeight: 700 }}>⚡</span>
          </div>
          <span style={{ color: "#ede9e0", fontSize: 14, fontWeight: 600 }}>Fitness Goal Coach</span>
        </div>

        <p style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          My transformation estimate
        </p>
        <p style={{ color: "#ede9e0", fontSize: 56, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.04em", marginBottom: 4 }}>
          {result.timeframeMin}–{result.timeframeMax}
        </p>
        <p style={{ color: "#9ca3af", fontSize: 20, marginBottom: 40 }}>{result.timeframeUnit}</p>

        <div style={{ display: "flex", gap: 16, marginBottom: 40 }}>
          {[
            { label: "Goal", value: goalLabels[state.questionnaire?.goalType ?? ""] ?? "General fitness" },
            { label: "Starting weight", value: `${state.onboarding?.weightKg ?? "—"}kg` },
            { label: "Confidence", value: result.confidenceLevel ? result.confidenceLevel.charAt(0).toUpperCase() + result.confidenceLevel.slice(1) : "—" },
          ].map(({ label, value }) => (
            <div key={label} style={{ flex: 1, background: "#1a1d2e", borderRadius: 10, padding: "16px 14px" }}>
              <p style={{ color: "#6b7280", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</p>
              <p style={{ color: "#ede9e0", fontSize: 14, fontWeight: 600 }}>{value}</p>
            </div>
          ))}
        </div>

        <p style={{ color: "#4b5563", fontSize: 11, borderTop: "1px solid #1f2335", paddingTop: 16 }}>
          fitnessgoalcoach.app · Evidence-based estimates, not promises.
        </p>
      </div>

      <Button variant="outline" size="sm" onClick={handleDownload} disabled={generating}>
        {generating ? "Generating…" : "⬇ Download results card"}
      </Button>
    </div>
  );
}
