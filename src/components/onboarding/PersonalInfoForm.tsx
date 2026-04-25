"use client";

import { useWizard } from "@/context/WizardContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sex, ExperienceLevel, ActivityLevel } from "@/lib/types";

export function PersonalInfoForm() {
  const { state, setOnboarding } = useWizard();
  const { onboarding } = state;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="name">First name</Label>
          <Input
            id="name"
            placeholder="Alex"
            value={onboarding.name}
            onChange={(e) => setOnboarding({ name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            min={16}
            max={80}
            placeholder="25"
            value={onboarding.age ?? ""}
            onChange={(e) => setOnboarding({ age: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Sex</Label>
          <Select
            value={onboarding.sex ?? ""}
            onValueChange={(v) => setOnboarding({ sex: v as Sex })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            placeholder="175"
            value={onboarding.heightCm ?? ""}
            onChange={(e) => setOnboarding({ heightCm: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            placeholder="75"
            value={onboarding.weightKg ?? ""}
            onChange={(e) => setOnboarding({ weightKg: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Training experience</Label>
          <Select
            value={onboarding.experience ?? ""}
            onValueChange={(v) => setOnboarding({ experience: v as ExperienceLevel })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner (0–1 yr)</SelectItem>
              <SelectItem value="intermediate">Intermediate (1–3 yrs)</SelectItem>
              <SelectItem value="advanced">Advanced (3+ yrs)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Activity level</Label>
          <Select
            value={onboarding.activityLevel ?? ""}
            onValueChange={(v) => setOnboarding({ activityLevel: v as ActivityLevel })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sedentary (desk job, little exercise)</SelectItem>
              <SelectItem value="light">Light (1–2 sessions/week)</SelectItem>
              <SelectItem value="moderate">Moderate (3–4 sessions/week)</SelectItem>
              <SelectItem value="active">Active (5–6 sessions/week)</SelectItem>
              <SelectItem value="very_active">Very active (daily + sport)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
