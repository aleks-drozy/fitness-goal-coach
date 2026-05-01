import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PremiumGateProps {
  feature: string;        // short name shown in heading, e.g. "Training plan"
  description: string;   // one sentence explaining what the feature does
}

export function PremiumGate({ feature, description }: PremiumGateProps) {
  return (
    <div
      className="rounded-[var(--r-card)] border p-8 text-center space-y-4"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div
        className="mx-auto flex size-10 items-center justify-center rounded-full text-lg"
        style={{ background: "var(--accent-dim)", color: "var(--primary)" }}
      >
        ⚡
      </div>

      <div className="space-y-1.5">
        <p className="font-semibold">{feature}</p>
        <p className="text-[0.875rem]" style={{ color: "var(--muted-foreground)" }}>
          {description}
        </p>
      </div>

      <div
        className="rounded-[var(--r-card)] border px-4 py-3 text-[0.8125rem]"
        style={{ borderColor: "var(--primary)", background: "var(--accent-dim)", color: "var(--primary)" }}
      >
        This feature is included in Combat Goal Coach Premium.
      </div>

      <Link
        href="/upgrade"
        className={cn(buttonVariants({ size: "lg" }), "w-full")}
      >
        Upgrade to Premium →
      </Link>
    </div>
  );
}
