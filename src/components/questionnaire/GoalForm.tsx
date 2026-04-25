"use client";

import { useWizard } from "@/context/WizardContext";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GoalType, WorkoutSetting } from "@/lib/types";

export function GoalForm() {
  const { state, setQuestionnaire } = useWizard();
  const { questionnaire } = state;

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Primary goal</Label>
        <Select
          value={questionnaire.goalType ?? ""}
          onValueChange={(v) => setQuestionnaire({ goalType: v as GoalType })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your goal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fat_loss">Fat loss</SelectItem>
            <SelectItem value="muscle_gain">Muscle gain</SelectItem>
            <SelectItem value="recomposition">Body recomposition (both)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Workout setting</Label>
        <Select
          value={questionnaire.workoutSetting ?? ""}
          onValueChange={(v) => setQuestionnaire({ workoutSetting: v as WorkoutSetting })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Where do you train?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gym">Gym</SelectItem>
            <SelectItem value="home">Home (limited equipment)</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="injuries">
          Any injuries, pain, or limitations?
          <span className="ml-1.5 text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>
            optional
          </span>
        </Label>
        <Textarea
          id="injuries"
          placeholder="e.g. left knee pain, lower back issues, avoid overhead pressing"
          value={questionnaire.injuries}
          onChange={(e) => setQuestionnaire({ injuries: e.target.value })}
          rows={3}
        />
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          For serious pain, see a physiotherapist before training.
        </p>
      </div>
    </div>
  );
}
