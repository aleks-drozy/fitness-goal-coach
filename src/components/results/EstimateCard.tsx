import { EstimateResult } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const confidenceLabel = {
  low: "Low confidence",
  medium: "Medium confidence",
  high: "High confidence",
};

const confidenceColor = {
  low: "bg-zinc-700 text-zinc-300",
  medium: "bg-yellow-900 text-yellow-300",
  high: "bg-green-900 text-green-300",
};

interface EstimateCardProps {
  result: EstimateResult;
}

export function EstimateCard({ result }: EstimateCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-3">
      <p className="text-xs uppercase tracking-widest text-zinc-500">Estimated timeframe</p>
      <p className="text-5xl font-semibold tracking-tight">
        {result.timeframeMin}–{result.timeframeMax}
        <span className="text-2xl font-normal text-zinc-400 ml-2">{result.timeframeUnit}</span>
      </p>
      <Badge
        className={`text-xs font-medium px-3 py-1 rounded-full ${confidenceColor[result.confidenceLevel]}`}
      >
        {confidenceLabel[result.confidenceLevel]}
      </Badge>
    </div>
  );
}
