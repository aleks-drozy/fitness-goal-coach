"use client";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateSelect } from "@/components/wizard/DateSelect";
import type { Sport } from "@/lib/types";

// Weight class data per sport (mirrors JudoForm.tsx)
const WEIGHT_CLASSES: Record<string, { men?: (number | string)[]; women?: (number | string)[]; unisex?: (number | string)[] }> = {
  judo: {
    men:   [60, 66, 73, 81, 90, 100, "100+"],
    women: [48, 52, 57, 63, 70, 78, "78+"],
  },
  bjj: {
    unisex: [57.5, 64, 70, 76, 82.3, 88.3, 94.3, 100.5, "100.5+"],
  },
  wrestling: {
    unisex: [57, 65, 74, 86, 97, 125],
  },
  mma: {
    unisex: [52.2, 56.7, 61.2, 65.8, 70.3, 77.1, 83.9, 93, "93+"],
  },
};

const BJJ_LABELS: Record<string, string> = {
  "57.5": "Rooster (–57.5kg)",
  "64": "Light Feather (–64kg)",
  "70": "Feather (–70kg)",
  "76": "Light (–76kg)",
  "82.3": "Middle (–82.3kg)",
  "88.3": "Medium Heavy (–88.3kg)",
  "94.3": "Heavy (–94.3kg)",
  "100.5": "Super Heavy (–100.5kg)",
  "100.5+": "Ultra Heavy (100.5kg+)",
};

const MMA_LABELS: Record<string, string> = {
  "52.2": "Strawweight",
  "56.7": "Flyweight",
  "61.2": "Bantamweight",
  "65.8": "Featherweight",
  "70.3": "Lightweight",
  "77.1": "Welterweight",
  "83.9": "Middleweight",
  "93": "Light Heavyweight",
  "93+": "Heavyweight",
};

function classLabel(sport: Sport, c: number | string): string {
  const key = String(c);
  if (sport === "bjj") return BJJ_LABELS[key] ?? key;
  if (sport === "mma") return MMA_LABELS[key] ?? `${c}kg`;
  if (sport === "wrestling") return `${c}kg`;
  // Judo
  return c === "100+" || c === "78+" ? `+${String(c).replace("+", "")}kg` : `u${c}kg`;
}

interface Prefill {
  currentWeight: number | null;
  weightClass: number | string | null;
  competitionDate: string | null;
  sport: Sport;
  sex: string | null;
}

interface WeeklyTarget {
  week: number;
  targetWeight: number;
  strategy: string;
  nutrition: string;
  training: string;
}

interface CutPlan {
  weeklyTargets: WeeklyTarget[];
  nutritionGuidelines: string;
  hydrationProtocol: string;
  trainingAdjustments: string;
  safetyWarnings: string[];
}

export function WeightCutClient({ prefill }: { prefill: Prefill }) {
  const reduced = useReducedMotion();
  const { sport, sex } = prefill;

  const sportData = WEIGHT_CLASSES[sport];
  const hasSportClasses = !!sportData;

  const [judoGender, setJudoGender] = useState<"men" | "women">(
    sex === "female" ? "women" : "men"
  );

  const [currentWeight, setCurrentWeight] = useState(
    prefill.currentWeight ? String(prefill.currentWeight) : ""
  );
  const [targetClass, setTargetClass] = useState<number | string>(prefill.weightClass ?? "");
  const [competitionDate, setCompetitionDate] = useState(prefill.competitionDate ?? "");
  const [dietQuality, setDietQuality] = useState(3);
  const [sessionsPerWeek, setSessionsPerWeek] = useState("4");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [safetyWarning, setSafetyWarning] = useState<string | null>(null);
  const [result, setResult] = useState<{ plan: CutPlan; kgToCut: string; daysLeft: number } | null>(null);

  const hasPrefill =
    (prefill.currentWeight !== null && prefill.currentWeight !== undefined) ||
    prefill.weightClass !== null ||
    prefill.competitionDate !== null;

  const classes = sportData?.unisex ?? (judoGender === "women" ? sportData?.women : sportData?.men) ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSafetyWarning(null);
    const res = await fetch("/api/weight-cut", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentWeight: parseFloat(currentWeight),
        targetClass,
        competitionDate,
        dietQuality,
        sessionsPerWeek: parseInt(sessionsPerWeek),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.status === 422 && data.safetyWarning) {
      setSafetyWarning(data.message);
      return;
    }
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setResult(data);
  }

  const stagger = { show: { transition: { staggerChildren: reduced ? 0 : 0.08 } }, hidden: {} };
  const slideIn = {
    hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, duration: 0.45, bounce: 0 } },
  };

  return (
    <div className="space-y-8">
      {hasPrefill && (
        <p className="text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>
          Pre-filled from your profile · Edit if needed
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-[var(--r-card)] border p-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="cw">Current weight (kg)</Label>
            <Input
              id="cw"
              type="number"
              step="0.1"
              min="40"
              max="200"
              placeholder="82.5"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Competition date</Label>
            <DateSelect
              id="date"
              min={new Date().toISOString().split("T")[0]}
              value={competitionDate || null}
              onChange={(v) => setCompetitionDate(v ?? "")}
            />
          </div>
        </div>

        {/* Sport-aware weight class selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Target weight class</Label>
            {sport === "judo" && (
              <div
                className="flex rounded-[var(--r-button)] border overflow-hidden text-[0.75rem]"
                style={{ borderColor: "var(--border)" }}
              >
                {(["men", "women"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => { setJudoGender(g); setTargetClass(""); }}
                    className="px-3 py-1 transition-colors capitalize"
                    style={{
                      background: judoGender === g ? "var(--primary)" : "transparent",
                      color: judoGender === g ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasSportClasses ? (
            <div className="flex flex-wrap gap-2">
              {classes.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setTargetClass(c)}
                  className="rounded-[var(--r-button)] border px-3 py-1.5 text-[0.875rem] font-medium transition-colors"
                  style={{
                    borderColor: targetClass === c ? "var(--primary)" : "var(--border)",
                    background: targetClass === c ? "var(--accent-dim)" : "transparent",
                    color: targetClass === c ? "var(--primary)" : "var(--muted-foreground)",
                  }}
                >
                  {classLabel(sport, c)}
                </button>
              ))}
            </div>
          ) : (
            <Input
              type="number"
              step="0.1"
              min="40"
              max="200"
              placeholder="Target kg"
              value={targetClass}
              onChange={(e) => setTargetClass(e.target.value ? Number(e.target.value) : "")}
              required
            />
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Diet quality: {dietQuality}/5 ({["", "Poor", "Below average", "Average", "Good", "Excellent"][dietQuality]})
          </Label>
          <input
            type="range"
            min={1}
            max={5}
            value={dietQuality}
            onChange={(e) => setDietQuality(+e.target.value)}
            className="w-full accent-[var(--primary)]"
            aria-label="Diet quality"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sesh">Training sessions per week</Label>
          <Input
            id="sesh"
            type="number"
            min="1"
            max="14"
            placeholder="5"
            value={sessionsPerWeek}
            onChange={(e) => setSessionsPerWeek(e.target.value)}
            required
          />
        </div>

        {safetyWarning && (
          <div
            className="rounded-[var(--r-card)] border p-4 space-y-1"
            style={{ borderColor: "var(--destructive)", background: "oklch(0.62 0.22 27 / 8%)" }}
          >
            <p className="text-[0.8125rem] font-semibold" style={{ color: "var(--destructive)" }}>
              Unsafe cut detected
            </p>
            <p className="text-[0.8125rem]" style={{ color: "var(--destructive)" }}>{safetyWarning}</p>
          </div>
        )}
        {error && <p className="text-[0.8125rem]" style={{ color: "var(--destructive)" }}>{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={loading || !targetClass}>
          {loading ? "Generating protocol…" : "Generate weight cut plan"}
        </Button>
      </form>

      {result && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          <motion.div
            variants={slideIn}
            className="rounded-[var(--r-card)] border p-4"
            style={{ borderColor: "var(--primary)", background: "var(--accent-dim)" }}
          >
            <p className="text-[0.875rem]">
              <span className="font-semibold" style={{ color: "var(--primary)" }}>{result.kgToCut}kg</span>
              {" "}to cut in{" "}
              <span className="font-semibold" style={{ color: "var(--primary)" }}>{result.daysLeft} days</span>
            </p>
          </motion.div>

          <motion.div variants={slideIn} className="space-y-3">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--primary)" }}>
              Week-by-week targets
            </p>
            {result.plan.weeklyTargets.map((w, i) => (
              <motion.div
                key={i}
                variants={slideIn}
                className="rounded-[var(--r-card)] border p-4 space-y-2"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-[0.875rem] font-semibold">Week {w.week}</span>
                  <span className="text-lg font-bold" style={{ color: "var(--primary)" }}>{w.targetWeight}kg</span>
                </div>
                <p className="text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>{w.strategy}</p>
                <div className="grid grid-cols-2 gap-2 text-[0.75rem]" style={{ color: "var(--muted-foreground)" }}>
                  <div><span className="font-medium">Nutrition:</span> {w.nutrition}</div>
                  <div><span className="font-medium">Training:</span> {w.training}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {[
            { label: "Nutrition guidelines", content: result.plan.nutritionGuidelines },
            { label: "Hydration protocol", content: result.plan.hydrationProtocol },
            { label: "Training adjustments", content: result.plan.trainingAdjustments },
          ].map(({ label, content }) => (
            <motion.div
              key={label}
              variants={slideIn}
              className="rounded-[var(--r-card)] border p-4 space-y-1.5"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--primary)" }}>
                {label}
              </p>
              <p className="text-[0.875rem] leading-relaxed">{content}</p>
            </motion.div>
          ))}

          {result.plan.safetyWarnings.length > 0 && (
            <motion.div
              variants={slideIn}
              className="rounded-[var(--r-card)] border p-4 space-y-2"
              style={{ borderColor: "var(--warn)", background: "var(--warn-dim)" }}
            >
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--warn)" }}>
                Safety notes
              </p>
              {result.plan.safetyWarnings.map((w, i) => (
                <p key={i} className="text-[0.8125rem]" style={{ color: "var(--warn)" }}>{w}</p>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
