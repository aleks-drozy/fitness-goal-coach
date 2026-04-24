interface TrainingGuidanceProps {
  guidance: string[];
}

export function TrainingGuidance({ guidance }: TrainingGuidanceProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-300">Suggested training structure</p>
      <ul className="space-y-2">
        {guidance.map((point, i) => (
          <li key={i} className="flex gap-2 text-sm text-zinc-400">
            <span className="text-zinc-600 shrink-0 font-medium">{i + 1}.</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
