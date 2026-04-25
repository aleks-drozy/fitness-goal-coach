interface NutritionNoteProps {
  note: string;
}

export function NutritionNote({ note }: NutritionNoteProps) {
  return (
    <div
      className="rounded-[var(--r-card)] border p-5 space-y-2"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <p
        className="text-[0.6875rem] font-medium tracking-[0.06em] uppercase"
        style={{ color: "var(--muted-foreground)" }}
      >
        Nutrition (general)
      </p>
      <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
        {note}
      </p>
    </div>
  );
}
