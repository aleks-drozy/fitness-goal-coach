interface NutritionNoteProps {
  note: string;
}

export function NutritionNote({ note }: NutritionNoteProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-1">
      <p className="text-xs uppercase tracking-widest text-zinc-500">Nutrition (general)</p>
      <p className="text-sm text-zinc-300 leading-relaxed">{note}</p>
    </div>
  );
}
