import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/config";

interface PremiumGateProps {
  feature: string;        // short name shown in heading, e.g. "Training plan"
  description: string;   // one sentence explaining what the feature does
}

export function PremiumGate({ feature, description }: PremiumGateProps) {
  return (
    <div
      className="rounded-[var(--r-card)] border p-7 space-y-5"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="space-y-1.5">
        <p
          className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
          style={{ color: "var(--primary)" }}
        >
          {APP_NAME} Premium
        </p>
        <p className="text-lg font-semibold tracking-tight">{feature}</p>
        <p className="text-[0.875rem] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          {description}
        </p>
      </div>

      <Link
        href="/upgrade"
        className={cn(buttonVariants({ size: "lg" }), "w-full")}
      >
        Upgrade to Premium →
      </Link>

      <p className="text-[0.8125rem]" style={{ color: "var(--muted-foreground)" }}>
        Already premium?{" "}
        <Link href="/dashboard" style={{ color: "var(--primary)" }}>
          Go to dashboard
        </Link>
      </p>
    </div>
  );
}
