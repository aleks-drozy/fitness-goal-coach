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
          className="bg-zinc-900 border-zinc-800"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Average session intensity</Label>
        <Select
          value={judo.intensity ?? ""}
          onValueChange={(v) => setJudo({ intensity: v as JudoIntensity })}
        >
          <SelectTrigger className="bg-zinc-900 border-zinc-800">
            <SelectValue placeholder="Select intensity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light (technique, drilling)</SelectItem>
            <SelectItem value="moderate">Moderate (randori, mixed)</SelectItem>
            <SelectItem value="hard">Hard (competition prep, heavy sparring)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-start gap-3">
        <Checkbox
          id="competition"
          checked={judo.hasCompetitionSoon}
          onCheckedChange={(v) => setJudo({ hasCompetitionSoon: Boolean(v) })}
        />
        <Label htmlFor="competition" className="text-sm leading-relaxed cursor-pointer">
          I have a competition or grading within the next 8 weeks
        </Label>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="weeklog">
          What did you do in judo this week?
          <span className="ml-1 text-xs text-zinc-500 font-normal">(optional but helpful)</span>
        </Label>
        <Textarea
          id="weeklog"
          placeholder="e.g. 2 randori sessions, worked on grip fighting, uchi-komi sets, drills"
          value={judo.weeklySessionLog}
          onChange={(e) => setJudo({ weeklySessionLog: e.target.value })}
          className="bg-zinc-900 border-zinc-800 resize-none"
          rows={3}
        />
        <p className="text-xs text-zinc-600">
          This helps us estimate how much training volume and fatigue to factor in when suggesting S&amp;C work.
        </p>
      </div>
    </div>
  );
}
