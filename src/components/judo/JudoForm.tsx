"use client";

import { useWizard } from "@/context/WizardContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateSelect } from "@/components/wizard/DateSelect";
import { JudoIntensity, Sport } from "@/lib/types";

// Weight class data per sport
const WEIGHT_CLASSES: Record<string, { men?: (number | string)[]; women?: (number | string)[]; unisex?: (number | string)[] }> = {
  judo: {
    men: [60, 66, 73, 81, 90, 100, "100+"],
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
  "52.2": "Strawweight (–52.2kg)",
  "56.7": "Flyweight (–56.7kg)",
  "61.2": "Bantamweight (–61.2kg)",
  "65.8": "Featherweight (–65.8kg)",
  "70.3": "Lightweight (–70.3kg)",
  "77.1": "Welterweight (–77.1kg)",
  "83.9": "Middleweight (–83.9kg)",
  "93": "Light Heavyweight (–93kg)",
  "93+": "Heavyweight (93kg+)",
};

const GRAPPLING_SPORTS: Sport[] = ["judo", "bjj", "wrestling", "mma"];

function WeightClassSelector({ sport, sex }: { sport: Sport; sex: string | null }) {
  const { state, setCompetitionContext } = useWizard();
  const { competitionContext } = state;

  const [judoGender, setJudoGender] = React.useState<"men" | "women">(
    sex === "female" ? "women" : "men"
  );

  const sportData = WEIGHT_CLASSES[sport];
  if (!sportData) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor="wc-input">Weight class (kg)</Label>
        <Input
          id="wc-input"
          type="number"
          step="0.1"
          min="40"
          max="200"
          placeholder="e.g. 73"
          value={competitionContext.weightClass ?? ""}
          onChange={(e) => setCompetitionContext({ weightClass: e.target.value ? Number(e.target.value) : null })}
        />
      </div>
    );
  }

  const classes = sportData.unisex ?? (judoGender === "women" ? sportData.women : sportData.men) ?? [];

  function labelFor(c: number | string): string {
    const key = String(c);
    if (sport === "bjj") return BJJ_LABELS[key] ?? key;
    if (sport === "mma") return MMA_LABELS[key] ?? key;
    if (sport === "wrestling") return `${c}kg`;
    // Judo
    return c === "100+" || c === "78+" ? `+${String(c).replace("+", "")}kg` : `u${c}kg`;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Weight class</Label>
        {sport === "judo" && (
          <div className="flex rounded-[var(--r-button)] border overflow-hidden text-[0.75rem]" style={{ borderColor: "var(--border)" }}>
            {(["men", "women"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setJudoGender(g);
                  setCompetitionContext({ weightClass: null });
                }}
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
      <div className="flex flex-wrap gap-2">
        {classes.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCompetitionContext({ weightClass: c })}
            className="rounded-[var(--r-button)] border px-3 py-1.5 text-[0.8125rem] font-medium transition-colors"
            style={{
              borderColor: competitionContext.weightClass === c ? "var(--primary)" : "var(--border)",
              background: competitionContext.weightClass === c ? "var(--accent-dim)" : "transparent",
              color: competitionContext.weightClass === c ? "var(--primary)" : "var(--muted-foreground)",
            }}
          >
            {labelFor(c)}
          </button>
        ))}
      </div>
    </div>
  );
}

import React from "react";

export function JudoForm() {
  const { state, setJudo, setCompetitionContext } = useWizard();
  const { judo, questionnaire, onboarding, competitionContext } = state;
  const sport = questionnaire.sport as Sport;
  const isGrappling = GRAPPLING_SPORTS.includes(sport);

  const today = new Date().toISOString().split("T")[0];

  const sportLabel = sport === "bjj" ? "BJJ" : sport === "mma" ? "MMA" : sport.charAt(0).toUpperCase() + sport.slice(1);

  return (
    <div className="space-y-5">
      {/* Existing judo/grappling fields */}
      <div className="space-y-1.5">
        <Label htmlFor="sessions">{sportLabel} sessions per week</Label>
        <Input
          id="sessions"
          type="number"
          min={1}
          max={14}
          placeholder="3"
          value={judo.sessionsPerWeek ?? ""}
          onChange={(e) => setJudo({ sessionsPerWeek: e.target.value ? Number(e.target.value) : null })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Average session intensity</Label>
        <Select
          value={judo.intensity ?? ""}
          onValueChange={(v) => setJudo({ intensity: v as JudoIntensity })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select intensity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light (technique, drilling)</SelectItem>
            <SelectItem value="moderate">Moderate (randori, mixed)</SelectItem>
            <SelectItem value="hard">Hard (competition prep, heavy sparring)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div
        className="flex items-start gap-3 rounded-[var(--r-card)] border p-4"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <Checkbox
          id="competition-soon"
          checked={judo.hasCompetitionSoon}
          onCheckedChange={(v) => setJudo({ hasCompetitionSoon: Boolean(v) })}
        />
        <Label htmlFor="competition-soon" className="text-sm leading-relaxed cursor-pointer font-normal">
          I have a competition or grading within the next 8 weeks
        </Label>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="weeklog">
          What did you do in {sportLabel.toLowerCase()} this week?
          <span className="ml-1.5 text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>
            optional but helpful
          </span>
        </Label>
        <Textarea
          id="weeklog"
          placeholder="e.g. 2 randori sessions, worked on grip fighting, uchi-komi sets, drills"
          value={judo.weeklySessionLog}
          onChange={(e) => setJudo({ weeklySessionLog: e.target.value })}
          rows={3}
        />
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Helps us estimate training volume and fatigue when suggesting S&amp;C work.
        </p>
      </div>

      {/* Competition context — only for grappling sports */}
      {isGrappling && (
        <div
          className="space-y-5 rounded-[var(--r-card)] border p-4 mt-2"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <p
            className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
            style={{ color: "var(--primary)" }}
          >
            Competition prep
          </p>

          <div
            className="flex items-start gap-3 rounded-[var(--r-card)] border p-4"
            style={{ borderColor: "var(--border)", background: "var(--background)" }}
          >
            <Checkbox
              id="actively-competing"
              checked={competitionContext.isActivelyCompeting}
              onCheckedChange={(v) => {
                setCompetitionContext({ isActivelyCompeting: Boolean(v) });
                if (!v) setCompetitionContext({ competitionDate: null, weightClass: null });
              }}
            />
            <Label htmlFor="actively-competing" className="text-sm leading-relaxed cursor-pointer font-normal">
              I&apos;m competing in the next 16 weeks and want a competition-anchored plan
            </Label>
          </div>

          {competitionContext.isActivelyCompeting && (
            <div className="space-y-5">
              <WeightClassSelector sport={sport} sex={onboarding.sex} />
              <div className="space-y-1.5">
                <Label>
                  Competition date
                  <span className="ml-1.5 text-[0.75rem] font-normal" style={{ color: "var(--muted-foreground)" }}>
                    required for competition-anchored estimate
                  </span>
                </Label>
                <DateSelect
                  id="comp-date"
                  min={today}
                  value={competitionContext.competitionDate}
                  onChange={(v) => setCompetitionContext({ competitionDate: v })}
                />
              </div>
            </div>
          )}

          {!competitionContext.isActivelyCompeting && (
            <div className="space-y-5">
              <WeightClassSelector sport={sport} sex={onboarding.sex} />
              <div className="space-y-1.5">
                <Label>
                  Upcoming competition date
                  <span className="ml-1.5 text-[0.75rem] font-normal" style={{ color: "var(--muted-foreground)" }}>
                    optional
                  </span>
                </Label>
                <DateSelect
                  id="comp-date-opt"
                  min={today}
                  value={competitionContext.competitionDate}
                  onChange={(v) => setCompetitionContext({ competitionDate: v })}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
