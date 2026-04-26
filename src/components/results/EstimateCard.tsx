import { EstimateResult } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

const confidenceLabel = {
  low: "Low confidence",
  medium: "Medium confidence",
  high: "High confidence",
} as const;

const confidenceVariant: Record<
  string,
  VariantProps<typeof badgeVariants>["variant"]
> = {
  low: "confidence-low",
  medium: "confidence-medium",
  high: "confidence-high",
};

interface EstimateCardProps {
  result: EstimateResult;
}

export function EstimateCard({ result }: EstimateCardProps) {
  return (
    <div
      className="rounded-[var(--r-card)] border overflow-hidden"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="px-6 py-7" style={{ background: "var(--accent-dim)" }}>
        <p
          className="text-[0.6875rem] font-medium tracking-[0.08em] uppercase mb-4"
          style={{ color: "var(--muted-foreground)" }}
        >
          Estimated timeframe
        </p>
        <p
          className="font-bold leading-none"
          style={{ fontSize: "4rem", letterSpacing: "-0.04em", color: "var(--foreground)" }}
        >
          {result.timeframeMin}–{result.timeframeMax}
          <span
            className="font-normal ml-3"
            style={{ fontSize: "1.5rem", letterSpacing: "0", color: "var(--muted-foreground)" }}
          >
            {result.timeframeUnit}
          </span>
        </p>
      </div>
      <div
        className="px-6 py-4 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <Badge variant={confidenceVariant[result.confidenceLevel]}>
          {confidenceLabel[result.confidenceLevel]}
        </Badge>
      </div>
    </div>
  );
}
