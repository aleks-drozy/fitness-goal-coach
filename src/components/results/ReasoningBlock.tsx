interface ReasoningBlockProps {
  reasoning: string[];
}

export function ReasoningBlock({ reasoning }: ReasoningBlockProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-300">Why this estimate?</p>
      <ul className="space-y-2">
        {reasoning.map((point, i) => (
          <li key={i} className="flex gap-2 text-sm text-zinc-400">
            <span className="text-zinc-600 shrink-0">—</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
