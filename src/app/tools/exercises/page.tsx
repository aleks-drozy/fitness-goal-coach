"use client";
import { useState, useMemo } from "react";
import exercises from "@/data/exercises.json";
import { Input } from "@/components/ui/input";

const categories = ["All", "Strength", "Cardio", "Mobility", "Judo Conditioning", "Recovery"];
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

type Exercise = {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment: string;
  difficulty: string;
  description: string;
  sets?: number;
  reps?: string;
  duration?: string;
};

export default function ExercisesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");

  const filtered = useMemo(() => {
    return (exercises as Exercise[]).filter((ex) => {
      const matchQ = !query || ex.name.toLowerCase().includes(query.toLowerCase()) ||
        ex.muscleGroups.some((m) => m.toLowerCase().includes(query.toLowerCase()));
      const matchC = category === "All" || ex.category === category;
      const matchD = difficulty === "All" || ex.difficulty === difficulty;
      return matchQ && matchC && matchD;
    });
  }, [query, category, difficulty]);

  const diffColor = (d: string) =>
    d === "Beginner" ? "var(--success)" : d === "Intermediate" ? "var(--warn)" : "var(--destructive)";

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--primary)" }}>Tools</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Exercise library</h1>
          <p className="mt-1.5 text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
            {exercises.length} exercises including judo-specific conditioning. Filter by category, difficulty, or muscle.
          </p>
        </div>

        <div className="space-y-3">
          <Input placeholder="Search by name or muscle group…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className="rounded-[var(--r-pill)] border px-3 py-1 text-[0.75rem] font-medium transition-colors"
                style={{
                  borderColor: category === c ? "var(--primary)" : "var(--border)",
                  background: category === c ? "var(--accent-dim)" : "transparent",
                  color: category === c ? "var(--primary)" : "var(--muted-foreground)",
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className="rounded-[var(--r-pill)] border px-3 py-1 text-[0.75rem] font-medium transition-colors"
                style={{
                  borderColor: difficulty === d ? "var(--primary)" : "var(--border)",
                  background: difficulty === d ? "var(--accent-dim)" : "transparent",
                  color: difficulty === d ? "var(--primary)" : "var(--muted-foreground)",
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>
          {filtered.length} exercise{filtered.length !== 1 ? "s" : ""}
        </p>

        <div className="space-y-2">
          {filtered.map((ex) => (
            <div
              key={ex.id}
              className="rounded-[var(--r-card)] border p-4 space-y-2"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[0.875rem] font-semibold">{ex.name}</p>
                  <div className="flex flex-wrap gap-1">
                    {ex.muscleGroups.map((m) => (
                      <span
                        key={m}
                        className="rounded-full px-2 py-0.5 text-[0.6875rem] font-medium"
                        style={{ background: "var(--surface-raised)", color: "var(--muted-foreground)" }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className="rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold"
                    style={{ background: `${diffColor(ex.difficulty)}20`, color: diffColor(ex.difficulty) }}
                  >
                    {ex.difficulty}
                  </span>
                  <span className="text-[0.6875rem]" style={{ color: "var(--muted-foreground)" }}>{ex.equipment}</span>
                </div>
              </div>
              <p className="text-[0.8125rem] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{ex.description}</p>
              {ex.sets !== undefined || ex.reps !== undefined || ex.duration !== undefined ? (
                <p className="text-[0.75rem]" style={{ color: "var(--primary)" }}>
                  {[ex.sets !== undefined && `${ex.sets} sets`, ex.reps, ex.duration].filter(Boolean).join(" × ")}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
