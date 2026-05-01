"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProgressFormProps {
  nextWeek: number;
  loggedWeeks: number[];
}

interface SuccessData {
  on_track: boolean;
  revised_estimate: string;
  ai_feedback: string;
  plan_updated: boolean;
}

export function ProgressForm({ nextWeek, loggedWeeks }: ProgressFormProps) {
  const router = useRouter();
  const [weekNumber, setWeekNumber] = useState(nextWeek);
  const [currentWeight, setCurrentWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessData | null>(null);

  // Weeks available to log: 1..nextWeek that haven't been logged yet
  const availableWeeks = Array.from({ length: nextWeek }, (_, i) => i + 1).filter(
    (w) => !loggedWeeks.includes(w)
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekNumber,
        currentWeight: parseFloat(currentWeight),
        notes,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSuccess({
      on_track: data.on_track,
      revised_estimate: data.revised_estimate,
      ai_feedback: data.ai_feedback,
      plan_updated: data.plan_updated ?? false,
    });
    router.refresh();
  }

  if (success) {
    return (
      <div
        className="rounded-[var(--r-card)] border p-6 space-y-4"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="size-2 rounded-full"
            style={{ background: success.on_track ? "var(--success)" : "var(--warn)" }}
          />
          <span className="text-[0.8125rem] font-medium" style={{ color: success.on_track ? "var(--success)" : "var(--warn)" }}>
            {success.on_track ? "You're on track" : "Needs attention"}
          </span>
        </div>

        <p className="text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
          {success.ai_feedback}
        </p>

        {success.revised_estimate && success.revised_estimate !== "On track with original estimate" && (
          <div
            className="rounded-[var(--r-input)] border px-3 py-2 text-[0.8125rem]"
            style={{ borderColor: "var(--border-strong)", color: "var(--foreground)" }}
          >
            Revised estimate: <span className="font-medium">{success.revised_estimate}</span>
          </div>
        )}

        {success.plan_updated && (
          <div
            className="rounded-[var(--r-input)] border px-3 py-2.5 text-[0.8125rem]"
            style={{ borderColor: "var(--primary)", background: "var(--accent-dim)" }}
          >
            <span className="font-medium" style={{ color: "var(--primary)" }}>Your plan was automatically updated.</span>
            {" "}
            <a href="/plan" style={{ color: "var(--primary)", textDecoration: "underline" }}>View updated plan</a>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSuccess(null);
            setCurrentWeight("");
            setNotes("");
            setWeekNumber(nextWeek + 1);
          }}
        >
          Log another week
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[var(--r-card)] border p-6 space-y-5"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      {/* Week picker — only shown when multiple unlogged weeks exist to backfill */}
      {availableWeeks.length > 1 ? (
        <div className="space-y-1.5">
          <Label>Week</Label>
          <Select
            value={String(weekNumber)}
            onValueChange={(v) => setWeekNumber(Number(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableWeeks.map((w) => (
                <SelectItem key={w} value={String(w)}>
                  Week {w}{w === nextWeek ? " (current)" : " (backfill)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <p className="text-[0.8125rem] font-medium" style={{ color: "var(--muted-foreground)" }}>
          Week {weekNumber}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="weight">Current weight (kg)</Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          min="20"
          max="300"
          placeholder="74.5"
          value={currentWeight}
          onChange={(e) => setCurrentWeight(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">How did the week go?</Label>
        <Textarea
          id="notes"
          placeholder="Training consistency, diet adherence, energy levels, anything notable…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      {error && (
        <p
          className="text-[0.8125rem] rounded-[var(--r-input)] border px-3 py-2"
          style={{
            borderColor: "var(--destructive)",
            background: "oklch(0.62 0.22 27 / 8%)",
            color: "var(--destructive)",
          }}
        >
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Analyzing…" : "Log this week"}
      </Button>
    </form>
  );
}
