"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AnalysisResult {
  analysis: string;
  revised_estimate: string | null;
}

export function PhotoComparison({ userId }: { userId: string }) {
  const router = useRouter();
  const [week1File, setWeek1File] = useState<File | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [week1Preview, setWeek1Preview] = useState<string | null>(null);
  const [currentPreview, setCurrentPreview] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState(50);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldownMsg, setCooldownMsg] = useState<string | null>(null);

  function handleFile(which: "week1" | "current") {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      if (which === "week1") { setWeek1File(file); setWeek1Preview(url); }
      else { setCurrentFile(file); setCurrentPreview(url); }
    };
  }

  async function handleAnalyze() {
    if (!week1File || !currentFile) return;
    setUploading(true);
    setError(null);
    setCooldownMsg(null);

    const supabase = createClient();
    const ext1 = week1File.name.split(".").pop();
    const ext2 = currentFile.name.split(".").pop();
    const path1 = `${userId}/week1-${Date.now()}.${ext1}`;
    const path2 = `${userId}/current-${Date.now()}.${ext2}`;

    const [up1, up2] = await Promise.all([
      supabase.storage.from("progress-photos").upload(path1, week1File, { upsert: true }),
      supabase.storage.from("progress-photos").upload(path2, currentFile, { upsert: true }),
    ]);

    if (up1.error || up2.error) {
      setError("Upload failed. Check file sizes (max 5MB each).");
      setUploading(false);
      return;
    }

    setUploading(false);
    setAnalyzing(true);

    const res = await fetch("/api/progress/photo-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ week1Path: path1, currentPath: path2 }),
    });
    const data = await res.json();
    setAnalyzing(false);

    if (!res.ok) {
      if (res.status === 429) setCooldownMsg(data.error);
      else setError(data.error ?? "Analysis failed.");
      return;
    }
    setResult(data);
    router.refresh();
  }

  const bothUploaded = !!week1Preview && !!currentPreview;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4">
        {(["week1", "current"] as const).map((which) => {
          const preview = which === "week1" ? week1Preview : currentPreview;
          const label = which === "week1" ? "Week 1 photo" : "Current photo";
          return (
            <div key={which} className="space-y-2">
              <Label>{label}</Label>
              <label
                className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center rounded-[var(--r-card)] border-2 border-dashed overflow-hidden"
                style={{
                  borderColor: preview ? "var(--primary)" : "var(--border)",
                  background: "var(--surface)",
                }}
              >
                {preview ? (
                  <img src={preview} alt={label} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <div className="text-2xl opacity-30">+</div>
                    <p className="text-[0.75rem]" style={{ color: "var(--muted-foreground)" }}>Tap to upload</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="sr-only" onChange={handleFile(which)} />
              </label>
            </div>
          );
        })}
      </div>

      {bothUploaded && (
        <div className="space-y-3">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--primary)" }}>Comparison</p>
          <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--r-card)] select-none" style={{ touchAction: "none" }}>
            <img src={week1Preview!} alt="Week 1" className="absolute inset-0 h-full w-full object-cover" />
            <img src={currentPreview!} alt="Current" className="absolute inset-0 h-full w-full object-cover" style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }} />
            <div className="absolute inset-y-0 w-0.5 -translate-x-1/2" style={{ left: `${sliderValue}%`, background: "var(--primary)" }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full border-2 shadow-lg" style={{ background: "var(--background)", borderColor: "var(--primary)" }}>
                <span className="text-[0.625rem]" style={{ color: "var(--primary)" }}>⟺</span>
              </div>
            </div>
            <input type="range" min={0} max={100} value={sliderValue} onChange={(e) => setSliderValue(Number(e.target.value))} className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" aria-label="Comparison slider" />
            <div className="absolute bottom-3 left-3 rounded px-2 py-0.5 text-[0.6875rem] font-medium" style={{ background: "oklch(0 0 0 / 50%)", color: "#fff" }}>Week 1</div>
            <div className="absolute bottom-3 right-3 rounded px-2 py-0.5 text-[0.6875rem] font-medium" style={{ background: "oklch(0.72 0.19 58 / 80%)", color: "var(--primary-foreground)" }}>Now</div>
          </div>
        </div>
      )}

      {cooldownMsg && (
        <div className="rounded-[var(--r-input)] border px-3 py-2 text-[0.8125rem]" style={{ borderColor: "var(--warn)", color: "var(--warn)", background: "var(--warn-dim)" }}>{cooldownMsg}</div>
      )}
      {error && <p className="text-[0.8125rem]" style={{ color: "var(--destructive)" }}>{error}</p>}

      {bothUploaded && !result && (
        <Button size="lg" className="w-full" onClick={handleAnalyze} disabled={uploading || analyzing}>
          {uploading ? "Uploading…" : analyzing ? "Analysing with AI…" : "Analyse my progress"}
        </Button>
      )}

      {result && (
        <div className="rounded-[var(--r-card)] border p-6 space-y-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--primary)" }}>AI Analysis</p>
          <p className="text-[0.875rem] leading-relaxed whitespace-pre-wrap">{result.analysis}</p>
          {result.revised_estimate && (
            <div className="rounded-[var(--r-input)] border px-3 py-2 text-[0.8125rem]" style={{ borderColor: "var(--border-strong)" }}>
              Revised estimate: <span className="font-medium">{result.revised_estimate}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
