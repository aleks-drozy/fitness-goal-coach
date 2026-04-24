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
        subtitle="Your free estimate is ready. Upgrade to get a detailed, personalised coaching plan."
      />
      <PremiumCard />
      <div className="text-center">
        <Link
          href="/coach/results"
          className={cn(buttonVariants({ variant: "ghost" }), "text-zinc-500 hover:text-zinc-300 text-sm")}
        >
          ← Back to my estimate
        </Link>
      </div>
    </div>
  );
}
