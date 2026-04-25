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
import { JudoIntensity } from "@/lib/types";

export function JudoForm() {
  const { state, setJudo } = useWizard();
  const { judo } = state;

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="sessions">Judo sessions per week</Label>
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
          id="competition"
          checked={judo.hasCompetitionSoon}
          onCheckedChange={(v) => setJudo({ hasCompetitionSoon: Boolean(v) })}
        />
        <Label htmlFor="competition" className="text-sm leading-relaxed cursor-pointer font-normal">
          I have a competition or grading within the next 8 weeks
        </Label>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="weeklog">
          What did you do in judo this week?
          <span
            className="ml-1.5 text-xs font-normal"
            style={{ color: "var(--muted-foreground)" }}
          >
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
    </div>
  );
}
