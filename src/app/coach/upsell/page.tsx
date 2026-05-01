import Link from "next/link";
import { StepHeader } from "@/components/wizard/StepHeader";
import { PremiumCard } from "@/components/upsell/PremiumCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function UpsellPage() {
  return (
    <div className="space-y-8">
      <StepHeader
        title="Want a full plan?"
        subtitle="Your free estimate is ready. Upgrade for a full training and weight cut plan."
      />
      <PremiumCard />
      <div className="text-center">
        <Link
          href="/coach/results"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-sm"
          )}
          style={{ color: "var(--muted-foreground)" }}
        >
          ← Back to my estimate
        </Link>
      </div>
    </div>
  );
}
